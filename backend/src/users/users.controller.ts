import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('public-stats')
  async getPublicStats() {
    return this.usersService.getPublicStats();
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Query('role') role?: string) {
    if (role === 'Admin') {
      return [];
    }

    return role ? this.usersService.getUsersByRole(role) : this.usersService.findAll();
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getStats() {
    return this.usersService.getStats();
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
  async search(@Query('q') searchTerm: string, @Query('role') role?: string) {
    if (role === 'Admin') {
      return [];
    }

    return this.usersService.searchUsers(searchTerm, role);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: any) {
    return this.usersService.findByIdForCurrentUser(req.user.userId);
  }

  @Get('me/favorites')
  @UseGuards(JwtAuthGuard)
  async getFavoritePatents(@Request() req: any) {
    return this.usersService.getFavoritePatents(req.user.userId);
  }

  @Put('me/favorites/:patentId')
  @UseGuards(JwtAuthGuard)
  async toggleFavoritePatent(@Param('patentId') patentId: string, @Request() req: any) {
    return this.usersService.toggleFavoritePatent(req.user.userId, patentId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.usersService.findByIdPublic(id, req.user.userId, req.user.role);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Request() req: any, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.userId, updateUserDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Request() req: any) {
    if (id !== req.user.userId) {
      throw new ForbiddenException('You can only update your own account');
    }

    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string, @Request() req: any) {
    if (id !== req.user.userId) {
      throw new ForbiddenException('You can only delete your own account');
    }
    await this.usersService.delete(id);
    return { message: 'Account deleted successfully' };
  }
}
