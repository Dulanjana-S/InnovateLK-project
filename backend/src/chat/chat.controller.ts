import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  Put,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  async getConversations(@Request() req: any) {
    return this.chatService.getUserConversations(req.user.userId);
  }

  @Get('conversations/:id')
  async getConversation(@Param('id') id: string, @Request() req: any) {
    return this.chatService.getConversation(id, req.user.userId);
  }

  @Post('conversations')
  async createConversation(@Body() body: { participants: string[] }, @Request() req: any) {
    return this.chatService.createConversation(req.user.userId, body.participants);
  }

  @Post('direct/:userId')
  async getOrCreateDirectConversation(@Param('userId') userId: string, @Request() req: any) {
    return this.chatService.getOrCreateDirectConversation(req.user.userId, userId);
  }

  @Get('messages/:conversationId')
  async getMessages(
    @Param('conversationId') conversationId: string,
    @Request() req: any,
    @Query('limit') limit?: number,
  ) {
    return this.chatService.getMessages(conversationId, req.user.userId, limit);
  }

  @Put('conversations/:id/read')
  async markConversationAsRead(@Param('id') id: string, @Request() req: any) {
    return this.chatService.markConversationAsRead(id, req.user.userId);
  }

  @Post('messages')
  async sendMessage(
    @Body() body: { conversationId: string; content: string },
    @Request() req: any,
  ) {
    return this.chatService.createMessage(
      body.conversationId,
      req.user.userId,
      body.content,
    );
  }

  @Delete('conversations/:id')
  async deleteConversation(@Param('id') id: string, @Request() req: any) {
    return this.chatService.deleteConversation(id, req.user.userId);
  }
}
