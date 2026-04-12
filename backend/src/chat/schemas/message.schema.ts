import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  @Prop({ type: Types.ObjectId, ref: 'Conversation', required: true })
  conversation: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sender: Types.ObjectId;

  @Prop({ required: true, trim: true })
  content: string;

  @Prop({ type: String, enum: ['text', 'image', 'file'], default: 'text' })
  type: string;

  @Prop({ default: false })
  read: boolean;

  @Prop({ default: null })
  readAt: Date;

  @Prop({ type: [String], default: [] })
  attachments: string[];
}

export const MessageSchema = SchemaFactory.createForClass(Message);

MessageSchema.index({ conversation: 1, createdAt: -1 });
MessageSchema.index({ sender: 1 });
MessageSchema.index({ conversation: 1, sender: 1, read: 1 });
