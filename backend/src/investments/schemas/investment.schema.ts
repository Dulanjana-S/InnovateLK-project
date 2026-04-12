import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type InvestmentDocument = HydratedDocument<Investment>;

@Schema({ timestamps: true })
export class Investment {
  @Prop({ type: Types.ObjectId, ref: 'Patent', required: true })
  patent: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  investor: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  innovator: Types.ObjectId;

  @Prop({ enum: ['Investor', 'Manufacturer'], required: true })
  partnerRole: string;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ min: 0, max: 100, default: 0 })
  equity: number;

  @Prop({ default: 0 })
  returns: number;

  @Prop({ enum: ['pending', 'active', 'completed', 'cancelled'], default: 'pending' })
  status: string;

  @Prop({ default: '' })
  nextMilestone: string;

  @Prop({ default: '' })
  notes: string;
}

export const InvestmentSchema = SchemaFactory.createForClass(Investment);
InvestmentSchema.index({ investor: 1, patent: 1 }, { unique: true });
