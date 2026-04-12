import { Body, Controller, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { InvestmentsService } from './investments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { UpdateInvestmentDto } from './dto/update-investment.dto';

@Controller('investments')
@UseGuards(JwtAuthGuard)
export class InvestmentsController {
  constructor(private readonly investmentsService: InvestmentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Investor', 'Manufacturer')
  async create(@Body() createInvestmentDto: CreateInvestmentDto, @Request() req) {
    return this.investmentsService.create(createInvestmentDto, req.user.userId, req.user.role);
  }

  @Get()
  async findMine(@Request() req) {
    return this.investmentsService.findMine(req.user.userId);
  }

  @Get(':id')
  async findById(@Param('id') id: string, @Request() req) {
    return this.investmentsService.findById(id, req.user.userId);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateInvestmentDto: UpdateInvestmentDto, @Request() req) {
    return this.investmentsService.update(id, updateInvestmentDto, req.user.userId, req.user.role);
  }
}
