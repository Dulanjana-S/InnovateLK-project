import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SupportTicketDocument = SupportTicket & Document;

@Schema({ timestamps: true })
export class SupportTicket {
  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  user: Types.ObjectId | null;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, trim: true })
  subject: string;

  @Prop({ required: true, trim: true })
  message: string;

  @Prop({ enum: ['open', 'in_progress', 'resolved'], default: 'open' })
  status: 'open' | 'in_progress' | 'resolved';

  @Prop({ enum: ['normal', 'high'], default: 'normal' })
  priority: 'normal' | 'high';
}

export const SupportTicketSchema = SchemaFactory.createForClass(SupportTicket);

SupportTicketSchema.index({ user: 1, createdAt: -1 });
SupportTicketSchema.index({ email: 1, createdAt: -1 });
SupportTicketSchema.index({ status: 1, createdAt: -1 });
