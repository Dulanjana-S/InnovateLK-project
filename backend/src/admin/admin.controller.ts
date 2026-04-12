import { Body, Controller, Get, Param, Patch, Query, Request, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { AdminModeratePatentDto } from './dto/admin-moderate-patent.dto';
import { AdminUpdateInvestmentDto } from './dto/admin-update-investment.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('overview')
  async getOverview() {
    return this.adminService.getOverview();
  }

  @Get('analytics')
  async getAnalytics() {
    return this.adminService.getAnalytics();
  }

  @Get('users')
  async getUsers(
    @Query('role') role?: string,
    @Query('search') search?: string,
    @Query('verified') verified?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.adminService.getUsers({ role, search, verified, isActive });
  }

  @Patch('users/:id')
  async updateUser(@Param('id') id: string, @Body() body: AdminUpdateUserDto) {
    return this.adminService.updateUser(id, body);
  }

  @Get('patents')
  async getPatents(
    @Query('moderationStatus') moderationStatus?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getPatents({ moderationStatus, status, search });
  }

  @Patch('patents/:id')
  async moderatePatent(@Param('id') id: string, @Body() body: AdminModeratePatentDto, @Request() req: any) {
    return this.adminService.moderatePatent(id, body, req.user.userId);
  }

  @Get('investments')
  async getInvestments(
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getInvestments({ status, search });
  }

  @Patch('investments/:id')
  async updateInvestment(@Param('id') id: string, @Body() body: AdminUpdateInvestmentDto) {
    return this.adminService.updateInvestment(id, body);
  }
}
