import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PatentsService } from './patents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreatePatentDto } from './dto/create-patent.dto';
import { UpdatePatentDto } from './dto/update-patent.dto';

@Controller('patents')
export class PatentsController {
  constructor(private readonly patentsService: PatentsService) {}

  @Get()
  async findAll(
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: number,
    @Query('skip') skip?: number,
  ) {
    return this.patentsService.findAll({
      category,
      status,
      search,
      limit,
      skip,
    });
  }

  @Get('featured')
  async getFeatured() {
    return this.patentsService.getFeatured();
  }

  @Get('trending')
  async getTrending() {
    return this.patentsService.getTrending();
  }

  @Get('stats')
  async getStats() {
    return this.patentsService.getStats();
  }

  @Get('analytics/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Innovator')
  async getMyAnalytics(@Request() req: any) {
    return this.patentsService.getAnalyticsForInnovator(req.user.userId);
  }

  @Get('search')
  async search(
    @Query('q') searchTerm: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
  ) {
    return this.patentsService.search(searchTerm, { category, status });
  }

  @Get('my-patents')
  @UseGuards(JwtAuthGuard)
  async getMyPatents(@Request() req: any) {
    return this.patentsService.findByInnovator(req.user.userId);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.patentsService.findById(id, req.user?.userId, req.user?.role);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Innovator')
  async create(@Body() createPatentDto: CreatePatentDto, @Request() req: any) {
    return this.patentsService.create(createPatentDto, req.user.userId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updatePatentDto: UpdatePatentDto,
    @Request() req: any,
  ) {
    return this.patentsService.update(id, updatePatentDto, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.patentsService.delete(id, req.user.userId);
  }

  @Post(':id/interest')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Investor', 'Manufacturer')
  async expressInterest(@Param('id') id: string, @Request() req: any) {
    return this.patentsService.expressInterest(id, req.user.userId);
  }

  @Delete(':id/interest')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Investor', 'Manufacturer')
  async removeInterest(@Param('id') id: string, @Request() req: any) {
    return this.patentsService.removeInterest(id, req.user.userId);
  }

  @Post(':id/request-details')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Investor', 'Manufacturer')
  async requestFullDetails(@Param('id') id: string, @Body() body: { note?: string }, @Request() req: any) {
    return this.patentsService.requestFullDetails(id, req.user.userId, body?.note || '');
  }

  @Put(':id/request-details/:requestUserId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Innovator')
  async respondToDetailRequest(
    @Param('id') id: string,
    @Param('requestUserId') requestUserId: string,
    @Body() body: { status: 'approved' | 'declined'; responseNote?: string },
    @Request() req: any,
  ) {
    return this.patentsService.respondToDetailRequest(
      id,
      requestUserId,
      req.user.userId,
      body.status,
      body.responseNote || '',
    );
  }
}
