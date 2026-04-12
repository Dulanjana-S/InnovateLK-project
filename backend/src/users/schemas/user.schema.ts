import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserRole = 'Innovator' | 'Investor' | 'Manufacturer' | 'Admin';
export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: ['Innovator', 'Investor', 'Manufacturer', 'Admin'] })
  role: UserRole;

  @Prop({ required: true })
  country: string;

  @Prop({ default: '' })
  avatar: string;

  @Prop({ default: '' })
  bio: string;

  @Prop({ default: '' })
  company: string;

  @Prop({ default: false })
  verified: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Patent' }], default: [] })
  favoritePatents: Types.ObjectId[];

  @Prop({ type: Object, default: {} })
  preferences: {
    emailNotifications?: boolean;
    marketingEmails?: boolean;
    language?: string;
  };

  @Prop({ type: Object, default: {} })
  profile: {
    phone?: string;
    website?: string;
    linkedin?: string;
    industries?: string[];
    investmentRange?: string;
    manufacturingCapacity?: string;
    expertise?: string[];
  };

  @Prop({ default: null })
  lastLoginAt: Date;

  @Prop({ default: null })
  emailVerifiedAt: Date;

  @Prop({ default: null })
  refreshToken: string | null;

  @Prop({ default: null })
  passwordResetToken: string | null;

  @Prop({ default: null })
  passwordResetExpiresAt: Date | null;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ verified: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ favoritePatents: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ passwordResetToken: 1 });
