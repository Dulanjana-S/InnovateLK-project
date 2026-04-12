import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { SupportService } from './support.service';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('tickets')
  @UseGuards(JwtAuthGuard)
  async createTicket(@Body() createSupportTicketDto: CreateSupportTicketDto, @Request() req?: any) {
    const userId = req?.user?.userId;
    return this.supportService.createTicket(createSupportTicketDto, userId);
  }

  @Get('my-tickets')
  @UseGuards(JwtAuthGuard)
  async getMyTickets(@Request() req: any) {
    return this.supportService.getMyTickets(req.user.userId);
  }
}
