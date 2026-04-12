import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Investment, InvestmentDocument } from './schemas/investment.schema';
import { Patent, PatentDocument } from '../patents/schemas/patent.schema';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { UpdateInvestmentDto } from './dto/update-investment.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class InvestmentsService {
  constructor(
    @InjectModel(Investment.name) private readonly investmentModel: Model<InvestmentDocument>,
    @InjectModel(Patent.name) private readonly patentModel: Model<PatentDocument>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createInvestmentDto: CreateInvestmentDto, userId: string, userRole: string): Promise<InvestmentDocument> {
    const patent = await this.patentModel.findById(createInvestmentDto.patentId).exec();

    if (!patent) {
      throw new NotFoundException('Patent not found');
    }

    if (!patent.isPublic || patent.moderationStatus !== 'approved') {
      throw new BadRequestException('Only approved public patents can receive investment proposals');
    }

    if (!['Investor', 'Manufacturer'].includes(userRole)) {
      throw new ForbiddenException('Only investors and manufacturers can create proposals');
    }

    if (patent.innovator.toString() === userId) {
      throw new BadRequestException('You cannot invest in your own patent');
    }

    const existing = await this.investmentModel.findOne({
      patent: patent._id,
      investor: userId,
    }).exec();

    if (existing) {
      throw new BadRequestException('You already have an investment record for this patent');
    }

    const created = await this.investmentModel.create({
      patent: patent._id,
      investor: userId,
      innovator: patent.innovator,
      partnerRole: userRole,
      amount: createInvestmentDto.amount,
      equity: createInvestmentDto.equity ?? 0,
      nextMilestone: createInvestmentDto.nextMilestone ?? '',
      notes: createInvestmentDto.notes ?? '',
      status: 'pending',
      returns: 0,
    });

    const proposalLabel = userRole === 'Manufacturer' ? 'manufacturing partnership proposal' : 'investment proposal';

    await this.notificationsService.create(
      patent.innovator.toString(),
      'investment',
      `New ${proposalLabel}`,
      `You received a new ${proposalLabel} for ${patent.title}. Review it in your investments area.`,
      { investmentId: created._id.toString(), patentId: patent._id.toString(), investorId: userId },
      '/investments',
    );

    return this.findById(created._id.toString(), userId);
  }

  async findMine(userId: string): Promise<InvestmentDocument[]> {
    return this.investmentModel
      .find({
        $or: [{ investor: userId }, { innovator: userId }],
      })
      .populate('patent', 'title category fundingRequired investmentStage image moderationStatus isPublic')
      .populate('investor', 'name email avatar company country role')
      .populate('innovator', 'name email avatar company country role')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string, userId: string): Promise<InvestmentDocument> {
    const investment = await this.investmentModel
      .findById(id)
      .populate('patent', 'title category fundingRequired investmentStage image moderationStatus isPublic')
      .populate('investor', 'name email avatar company country role')
      .populate('innovator', 'name email avatar company country role')
      .exec();

    if (!investment) {
      throw new NotFoundException('Investment not found');
    }

    const investorId = ((investment.investor as any)?._id ?? investment.investor)?.toString?.();
    const innovatorId = ((investment.innovator as any)?._id ?? investment.innovator)?.toString?.();

    if (investorId !== userId && innovatorId !== userId) {
      throw new ForbiddenException('You do not have access to this investment');
    }

    return investment;
  }

  async update(id: string, updateInvestmentDto: UpdateInvestmentDto, userId: string, userRole: string): Promise<InvestmentDocument> {
    const investment = await this.investmentModel.findById(id).exec();

    if (!investment) {
      throw new NotFoundException('Investment not found');
    }

    const isProposalOwner = investment.investor.toString() === userId;
    const isInnovatorOwner = investment.innovator.toString() === userId;

    if (!isProposalOwner && !isInnovatorOwner) {
      throw new ForbiddenException('You do not have access to update this investment');
    }

    const sanitizedUpdate = this.getPermittedUpdateFields(investment, updateInvestmentDto, {
      isProposalOwner,
      isInnovatorOwner,
      userRole,
    });

    if (Object.keys(sanitizedUpdate).length === 0) {
      throw new BadRequestException('No permitted changes were provided for this investment stage');
    }

    Object.assign(investment, sanitizedUpdate);
    await investment.save();

    const notifyUserId = isProposalOwner
      ? investment.innovator.toString()
      : investment.investor.toString();

    await this.notificationsService.create(
      notifyUserId,
      'investment',
      this.getNotificationTitle(investment.status, isProposalOwner, investment.partnerRole),
      this.getNotificationBody(investment.status, isProposalOwner, investment.partnerRole),
      { investmentId: investment._id.toString(), status: investment.status },
      '/investments',
    );

    return this.findById(id, userId);
  }

  private getPermittedUpdateFields(
    investment: InvestmentDocument,
    updateInvestmentDto: UpdateInvestmentDto,
    context: { isProposalOwner: boolean; isInnovatorOwner: boolean; userRole: string },
  ) {
    const { isProposalOwner, isInnovatorOwner } = context;
    const sanitized: Record<string, any> = {};
    const status = investment.status;

    if (['completed', 'cancelled'].includes(status)) {
      throw new BadRequestException('This record is closed and can no longer be edited');
    }

    if (status === 'pending') {
      if (isProposalOwner) {
        if (typeof updateInvestmentDto.amount === 'number') sanitized.amount = updateInvestmentDto.amount;
        if (typeof updateInvestmentDto.equity === 'number') sanitized.equity = updateInvestmentDto.equity;
        if (typeof updateInvestmentDto.nextMilestone === 'string') sanitized.nextMilestone = updateInvestmentDto.nextMilestone;
        if (typeof updateInvestmentDto.notes === 'string') sanitized.notes = updateInvestmentDto.notes;
        if (updateInvestmentDto.status) {
          if (updateInvestmentDto.status !== 'cancelled') {
            throw new ForbiddenException('Pending proposals can only be withdrawn by the proposal owner');
          }
          sanitized.status = 'cancelled';
        }
        if (typeof updateInvestmentDto.returns === 'number') {
          throw new ForbiddenException('Returns can only be recorded after the deal is active');
        }
      }

      if (isInnovatorOwner) {
        if (typeof updateInvestmentDto.equity === 'number') sanitized.equity = updateInvestmentDto.equity;
        if (typeof updateInvestmentDto.nextMilestone === 'string') sanitized.nextMilestone = updateInvestmentDto.nextMilestone;
        if (typeof updateInvestmentDto.notes === 'string') sanitized.notes = updateInvestmentDto.notes;
        if (updateInvestmentDto.status) {
          if (!['active', 'cancelled'].includes(updateInvestmentDto.status)) {
            throw new ForbiddenException('Innovators can only approve or decline pending proposals');
          }
          sanitized.status = updateInvestmentDto.status;
        }
        if (typeof updateInvestmentDto.amount === 'number') {
          throw new ForbiddenException('Only the proposal owner can change the proposed amount while pending');
        }
        if (typeof updateInvestmentDto.returns === 'number') {
          throw new ForbiddenException('Returns can only be recorded after the deal is active');
        }
      }
    }

    if (status === 'active') {
      if (isProposalOwner) {
        if (typeof updateInvestmentDto.nextMilestone === 'string') sanitized.nextMilestone = updateInvestmentDto.nextMilestone;
        if (typeof updateInvestmentDto.notes === 'string') sanitized.notes = updateInvestmentDto.notes;
        if (updateInvestmentDto.status) {
          if (updateInvestmentDto.status !== 'cancelled') {
            throw new ForbiddenException('The proposal owner can only cancel an active deal from this screen');
          }
          sanitized.status = 'cancelled';
        }
        if (typeof updateInvestmentDto.amount === 'number' || typeof updateInvestmentDto.equity === 'number' || typeof updateInvestmentDto.returns === 'number') {
          throw new ForbiddenException('Amount, equity, and returns are controlled by the innovator once the deal is active');
        }
      }

      if (isInnovatorOwner) {
        if (typeof updateInvestmentDto.equity === 'number') sanitized.equity = updateInvestmentDto.equity;
        if (typeof updateInvestmentDto.nextMilestone === 'string') sanitized.nextMilestone = updateInvestmentDto.nextMilestone;
        if (typeof updateInvestmentDto.notes === 'string') sanitized.notes = updateInvestmentDto.notes;
        if (typeof updateInvestmentDto.returns === 'number') sanitized.returns = updateInvestmentDto.returns;
        if (updateInvestmentDto.status) {
          if (!['active', 'completed', 'cancelled'].includes(updateInvestmentDto.status)) {
            throw new ForbiddenException('Invalid active-deal status update');
          }
          sanitized.status = updateInvestmentDto.status;
        }
        if (typeof updateInvestmentDto.amount === 'number') {
          throw new ForbiddenException('Amount is locked once the deal is active');
        }
      }
    }

    return sanitized;
  }

  private getNotificationTitle(status: string, updatedByProposalOwner: boolean, partnerRole: string) {
    if (status === 'active') {
      return `${partnerRole === 'Manufacturer' ? 'Partnership' : 'Investment'} approved`;
    }

    if (status === 'completed') {
      return 'Deal completed';
    }

    if (status === 'cancelled') {
      return updatedByProposalOwner ? 'Proposal withdrawn' : 'Proposal declined';
    }

    return 'Investment record updated';
  }

  private getNotificationBody(status: string, updatedByProposalOwner: boolean, partnerRole: string) {
    if (status === 'active') {
      return `The innovator approved this ${partnerRole === 'Manufacturer' ? 'manufacturing partnership' : 'investment'} proposal.`;
    }

    if (status === 'completed') {
      return 'This deal was marked as completed.';
    }

    if (status === 'cancelled') {
      return updatedByProposalOwner
        ? `The ${partnerRole === 'Manufacturer' ? 'partnership' : 'investment'} proposal was withdrawn by the proposer.`
        : `The ${partnerRole === 'Manufacturer' ? 'partnership' : 'investment'} proposal was declined or cancelled by the innovator.`;
    }

    return 'An investment record you are part of has been updated.';
  }
}
