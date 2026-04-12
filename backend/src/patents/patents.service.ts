import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Patent, PatentDocument } from './schemas/patent.schema';
import { CreatePatentDto } from './dto/create-patent.dto';
import { UpdatePatentDto } from './dto/update-patent.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class PatentsService {
  constructor(
    @InjectModel(Patent.name) private patentModel: Model<PatentDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly notificationsService: NotificationsService,
  ) {}

  private getPublicQuery(filters: any = {}) {
    const query: any = {
      isPublic: true,
      $or: [
        { moderationStatus: 'approved' },
        { moderationStatus: { $exists: false } },
      ],
    };

    if (filters.category && filters.category !== 'All Categories') {
      query.category = filters.category;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    return query;
  }

  private canAccessPatent(patent: PatentDocument, viewerUserId?: string, viewerRole?: string) {
    if (viewerRole === 'Admin') {
      return true;
    }

    if (viewerUserId && patent.innovator.toString() === viewerUserId) {
      return true;
    }

    return patent.isPublic && patent.moderationStatus === 'approved';
  }

  private sanitizePatentForViewer(patent: any, viewerUserId?: string, viewerRole?: string) {
    const plainPatent = patent.toObject ? patent.toObject() : patent;
    const isOwner = viewerUserId && (plainPatent.innovator?._id?.toString?.() || plainPatent.innovator?.toString?.()) === viewerUserId;
    const isAdmin = viewerRole === 'Admin';

    if (isOwner || isAdmin) {
      return plainPatent;
    }

    plainPatent.interestedUsers = (plainPatent.interestedUsers || []).filter((entry: any) => {
      const interestedUserId = entry?._id?.toString?.() || entry?.toString?.();
      return viewerUserId && interestedUserId === viewerUserId;
    });
    plainPatent.detailRequests = (plainPatent.detailRequests || []).filter((request: any) => {
      const requestUserId = request?.user?._id?.toString?.() || request?.user?.toString?.();
      return viewerUserId && requestUserId === viewerUserId;
    });

    return plainPatent;
  }

  async create(createPatentDto: CreatePatentDto, userId: string): Promise<PatentDocument> {
    const innovator = await this.userModel.findById(userId).exec();

    if (!innovator) {
      throw new NotFoundException('Innovator not found');
    }

    const patent = new this.patentModel({
      ...createPatentDto,
      innovator: userId,
      innovatorName: innovator.name,
      innovatorCountry: innovator.country,
      moderationStatus: 'pending_review',
      isPublic: false,
      isFeatured: false,
      adminNotes: '',
      reviewedBy: null,
      reviewedAt: null,
    });

    return patent.save();
  }

  async findAll(filters: any = {}): Promise<PatentDocument[]> {
    return this.patentModel
      .find(this.getPublicQuery(filters))
      .populate('innovator', 'name email country avatar company role verified bio profile')
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(filters.limit || 100)
      .skip(filters.skip || 0)
      .exec();
  }

  async findById(id: string, viewerUserId?: string, viewerRole?: string): Promise<any> {
    const patent = await this.patentModel
      .findById(id)
      .populate('innovator', 'name email country avatar company bio role verified profile')
      .populate('interestedUsers', 'name email role country avatar company')
      .populate('detailRequests.user', 'name email role country avatar company')
      .populate('reviewedBy', 'name email role')
      .exec();

    if (!patent) {
      throw new NotFoundException('Patent not found');
    }

    if (!this.canAccessPatent(patent, viewerUserId, viewerRole)) {
      throw new NotFoundException('Patent not found');
    }

    if (!(viewerRole === 'Admin' || (viewerUserId && patent.innovator.toString() === viewerUserId))) {
      patent.views += 1;
      await patent.save();
    }

    return this.sanitizePatentForViewer(patent, viewerUserId, viewerRole);
  }

  async findByInnovator(innovatorId: string): Promise<PatentDocument[]> {
    return this.patentModel
      .find({ innovator: innovatorId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async update(
    id: string,
    updatePatentDto: UpdatePatentDto,
    userId: string,
  ): Promise<PatentDocument> {
    const patent = await this.patentModel.findById(id);

    if (!patent) {
      throw new NotFoundException('Patent not found');
    }

    if (patent.innovator.toString() !== userId) {
      throw new ForbiddenException('You can only update your own patents');
    }

    const sanitizedUpdate: any = { ...updatePatentDto };
    delete sanitizedUpdate.moderationStatus;
    delete sanitizedUpdate.adminNotes;
    delete sanitizedUpdate.reviewedBy;
    delete sanitizedUpdate.reviewedAt;
    delete sanitizedUpdate.isFeatured;
    delete sanitizedUpdate.innovator;
    delete sanitizedUpdate.innovatorName;
    delete sanitizedUpdate.innovatorCountry;
    delete sanitizedUpdate.detailRequests;
    delete sanitizedUpdate.interestedUsers;

    Object.assign(patent, sanitizedUpdate);
    patent.moderationStatus = 'pending_review';
    patent.isPublic = false;
    patent.reviewedAt = null;
    patent.reviewedBy = null;
    await patent.save();

    return patent;
  }

  async delete(id: string, userId: string): Promise<void> {
    const patent = await this.patentModel.findById(id);

    if (!patent) {
      throw new NotFoundException('Patent not found');
    }

    if (patent.innovator.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own patents');
    }

    await this.patentModel.findByIdAndDelete(id);
  }

  async expressInterest(patentId: string, userId: string): Promise<any> {
    const patent = await this.patentModel.findById(patentId);

    if (!patent) {
      throw new NotFoundException('Patent not found');
    }

    if (!patent.isPublic || patent.moderationStatus !== 'approved') {
      throw new BadRequestException('This patent is not available for engagement yet');
    }

    if (patent.innovator.toString() === userId) {
      throw new BadRequestException('You cannot express interest in your own patent');
    }

    const alreadyInterested = patent.interestedUsers.some((user) => user.toString() === userId);

    if (!alreadyInterested) {
      patent.interestedUsers.push(userId as any);
      patent.interested = patent.interestedUsers.length;
      await patent.save();

      await this.notificationsService.create(
        patent.innovator.toString(),
        'interest',
        'New interest in your patent',
        `Someone expressed interest in ${patent.title}.`,
        { patentId: patent._id.toString(), interestedUserId: userId },
        `/patent/${patent._id.toString()}`,
      );
    }

    return this.findById(patentId, userId);
  }

  async removeInterest(patentId: string, userId: string): Promise<any> {
    const patent = await this.patentModel.findById(patentId);

    if (!patent) {
      throw new NotFoundException('Patent not found');
    }

    patent.interestedUsers = patent.interestedUsers.filter((user) => user.toString() !== userId);
    patent.interested = patent.interestedUsers.length;
    await patent.save();

    return this.findById(patentId, userId);
  }

  async requestFullDetails(patentId: string, userId: string, note = ''): Promise<any> {
    const patent = await this.patentModel.findById(patentId).exec();

    if (!patent) {
      throw new NotFoundException('Patent not found');
    }

    if (!patent.isPublic || patent.moderationStatus !== 'approved') {
      throw new BadRequestException('This patent is not available for detail requests yet');
    }

    if (patent.innovator.toString() === userId) {
      throw new BadRequestException('You cannot request full details for your own patent');
    }

    const existingRequest = (patent.detailRequests || []).find(
      (request: any) => request.user?.toString?.() === userId,
    );

    if (!existingRequest) {
      patent.detailRequests.push({
        user: userId as any,
        note: note?.trim?.() || '',
        status: 'pending',
        responseNote: '',
        createdAt: new Date(),
        respondedAt: null,
      } as any);
      await patent.save();

      await this.notificationsService.create(
        patent.innovator.toString(),
        'request',
        'New full details request',
        `Someone requested full details for ${patent.title}.`,
        { patentId: patent._id.toString(), requesterUserId: userId, note: note?.trim?.() || '' },
        `/patent/${patent._id.toString()}`,
      );
    }

    return this.findById(patentId, userId);
  }

  async respondToDetailRequest(
    patentId: string,
    requestUserId: string,
    innovatorId: string,
    status: 'approved' | 'declined',
    responseNote = '',
  ): Promise<PatentDocument> {
    const patent = await this.patentModel.findById(patentId).exec();

    if (!patent) {
      throw new NotFoundException('Patent not found');
    }

    if (patent.innovator.toString() !== innovatorId) {
      throw new ForbiddenException('You can only manage requests for your own patent');
    }

    const request = (patent.detailRequests || []).find(
      (entry: any) => entry.user?.toString?.() === requestUserId,
    );

    if (!request) {
      throw new NotFoundException('Detail request not found');
    }

    request.status = status;
    request.responseNote = responseNote?.trim?.()
      || (status === 'approved'
        ? 'The innovator approved your request. Continue in direct chat for the next step.'
        : 'The innovator declined this request at this time.');
    request.respondedAt = new Date();
    await patent.save();

    await this.notificationsService.create(
      requestUserId,
      'request_response',
      status === 'approved' ? 'Full details request approved' : 'Full details request declined',
      status === 'approved'
        ? `Your full details request for ${patent.title} was approved. Continue the conversation with the innovator for the next step.`
        : `Your full details request for ${patent.title} was declined.`,
      {
        patentId: patent._id.toString(),
        status,
        responseNote: request.responseNote,
        innovatorId,
      },
      status === 'approved' ? `/messages?userId=${innovatorId}` : `/patent/${patent._id.toString()}`,
    );

    return this.findById(patentId, innovatorId);
  }

  async search(searchTerm: string, filters: any = {}): Promise<PatentDocument[]> {
    const baseQuery: any = this.getPublicQuery(filters);
    delete baseQuery.$text;

    const moderationOr = baseQuery.$or;
    delete baseQuery.$or;

    const query: any = {
      ...baseQuery,
      $and: [
        ...(moderationOr ? [{ $or: moderationOr }] : []),
        {
          $or: [
            { title: { $regex: searchTerm, $options: 'i' } },
            { description: { $regex: searchTerm, $options: 'i' } },
            { tags: { $in: [new RegExp(searchTerm, 'i')] } },
          ],
        },
      ],
    };

    return this.patentModel
      .find(query)
      .populate('innovator', 'name email country avatar company role verified')
      .sort({ views: -1, interested: -1 })
      .limit(50)
      .exec();
  }

  async getFeatured(): Promise<PatentDocument[]> {
    return this.patentModel
      .find({
        isFeatured: true,
        isPublic: true,
        $or: [{ moderationStatus: 'approved' }, { moderationStatus: { $exists: false } }],
      })
      .populate('innovator', 'name email country avatar company role verified')
      .sort({ views: -1 })
      .limit(10)
      .exec();
  }

  async getTrending(): Promise<PatentDocument[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return this.patentModel
      .find({
        isPublic: true,
        createdAt: { $gte: thirtyDaysAgo },
        $or: [{ moderationStatus: 'approved' }, { moderationStatus: { $exists: false } }],
      })
      .populate('innovator', 'name email country avatar company role verified')
      .sort({ views: -1, interested: -1 })
      .limit(10)
      .exec();
  }

  async getStats(): Promise<any> {
    const publicQuery = {
      isPublic: true,
      $or: [{ moderationStatus: 'approved' }, { moderationStatus: { $exists: false } }],
    };
    const total = await this.patentModel.countDocuments(publicQuery);
    const active = await this.patentModel.countDocuments({ ...publicQuery, status: 'Active' });
    const pending = await this.patentModel.countDocuments({ ...publicQuery, status: 'Pending' });
    const granted = await this.patentModel.countDocuments({ ...publicQuery, status: 'Granted' });

    const categoryStats = await this.patentModel.aggregate([
      { $match: publicQuery },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return {
      total,
      active,
      pending,
      granted,
      categories: categoryStats,
    };
  }

  async getAnalyticsForInnovator(userId: string) {
    const patents = await this.findByInnovator(userId);
    const totalPatents = patents.length;
    const totalViews = patents.reduce((sum, patent) => sum + (patent.views || 0), 0);
    const totalInterest = patents.reduce((sum, patent) => sum + (patent.interested || 0), 0);
    const totalDetailRequests = patents.reduce((sum, patent: any) => sum + ((patent.detailRequests || []).length), 0);

    const performance = patents.map((patent: any) => ({
      id: patent._id.toString(),
      title: patent.title,
      views: patent.views || 0,
      interested: patent.interested || 0,
      detailRequests: (patent.detailRequests || []).length,
      status: patent.status,
      moderationStatus: patent.moderationStatus || 'approved',
      category: patent.category,
      createdAt: patent.createdAt,
    }));

    const categoryMap = patents.reduce<Record<string, number>>((acc, patent) => {
      acc[patent.category] = (acc[patent.category] || 0) + 1;
      return acc;
    }, {});

    return {
      summary: {
        totalPatents,
        totalViews,
        totalInterest,
        totalDetailRequests,
        averageViewsPerPatent: totalPatents ? Number((totalViews / totalPatents).toFixed(2)) : 0,
      },
      performance,
      categories: Object.entries(categoryMap).map(([name, value]) => ({ name, value })),
    };
  }
}
