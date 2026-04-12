import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PatentDocument = Patent & Document;

@Schema({ timestamps: true, _id: false })
export class PatentDetailRequest {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ default: '' })
  note: string;

  @Prop({
    type: String,
    enum: ['pending', 'approved', 'declined'],
    default: 'pending',
  })
  status: string;

  @Prop({ default: '' })
  responseNote: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: null })
  respondedAt: Date | null;
}

export const PatentDetailRequestSchema = SchemaFactory.createForClass(PatentDetailRequest);

@Schema({ timestamps: true })
export class Patent {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, unique: true })
  patentNumber: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  innovator: Types.ObjectId;

  @Prop({ required: true })
  innovatorName: string;

  @Prop({ required: true })
  innovatorCountry: string;

  @Prop({ required: true })
  filingDate: Date;

  @Prop({
    required: true,
    enum: ['Active', 'Pending', 'Granted', 'Expired', 'Rejected'],
    default: 'Pending',
  })
  status: string;

  @Prop({
    enum: ['pending_review', 'approved', 'rejected'],
    default: 'pending_review',
  })
  moderationStatus: string;

  @Prop({ default: '' })
  adminNotes: string;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  reviewedBy: Types.ObjectId | null;

  @Prop({ default: null })
  reviewedAt: Date | null;

  @Prop({ required: true })
  fundingRequired: string;

  @Prop({ required: true })
  investmentStage: string;

  @Prop({ default: '' })
  image: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: 0 })
  views: number;

  @Prop({ default: 0 })
  interested: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  interestedUsers: Types.ObjectId[];

  @Prop({ type: [PatentDetailRequestSchema], default: [] })
  detailRequests: PatentDetailRequest[];

  @Prop({ type: Object, default: {} })
  technicalDetails: {
    abstract?: string;
    claims?: string[];
    specifications?: string;
    drawings?: string[];
    priorArt?: string[];
  };

  @Prop({ type: Object, default: {} })
  commercialization: {
    marketSize?: string;
    targetMarket?: string[];
    competitors?: string[];
    uniqueSellingPoint?: string;
    revenueModel?: string;
    timeline?: string;
  };

  @Prop({ type: [String], default: [] })
  documents: string[];

  @Prop({ default: false })
  isPublic: boolean;

  @Prop({ default: false })
  isFeatured: boolean;
}

export const PatentSchema = SchemaFactory.createForClass(Patent);

PatentSchema.index({ title: 'text', description: 'text', tags: 'text' });
PatentSchema.index({ category: 1 });
PatentSchema.index({ status: 1 });
PatentSchema.index({ moderationStatus: 1 });
PatentSchema.index({ innovator: 1 });
PatentSchema.index({ views: -1 });
PatentSchema.index({ interested: -1 });
PatentSchema.index({ createdAt: -1 });
PatentSchema.index({ 'detailRequests.user': 1 });
PatentSchema.index({ isPublic: 1, moderationStatus: 1 });
