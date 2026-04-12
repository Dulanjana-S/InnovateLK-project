import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SupportTicket, SupportTicketDocument } from './schemas/support-ticket.schema';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';

@Injectable()
export class SupportService {
  constructor(
    @InjectModel(SupportTicket.name)
    private readonly supportTicketModel: Model<SupportTicketDocument>,
  ) {}

  async createTicket(
    createSupportTicketDto: CreateSupportTicketDto,
    userId?: string,
  ): Promise<SupportTicketDocument> {
    return this.supportTicketModel.create({
      ...createSupportTicketDto,
      user: userId || null,
      email: createSupportTicketDto.email.toLowerCase(),
      priority: createSupportTicketDto.priority || 'normal',
    });
  }

  async getMyTickets(userId: string): Promise<SupportTicketDocument[]> {
    return this.supportTicketModel
      .find({ user: userId })
      .sort({ createdAt: -1 })
      .exec();
  }
}
