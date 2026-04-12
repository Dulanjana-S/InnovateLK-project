import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import { Patent, PatentDocument } from '../patents/schemas/patent.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Patent.name) private patentModel: Model<PatentDocument>,
  ) {}

  async create(createUserDto: any): Promise<UserDocument> {
    const user = new this.userModel({
      ...createUserDto,
      email: createUserDto.email.toLowerCase(),
    });
    return user.save();
  }

  async findAll(query: FilterQuery<UserDocument> = {}): Promise<UserDocument[]> {
    const finalQuery = {
      role: { $ne: 'Admin' },
      isActive: true,
      ...query,
    } as FilterQuery<UserDocument>;

    return this.userModel
      .find(finalQuery)
      .select('-password -refreshToken -passwordResetToken -passwordResetExpiresAt')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByIdForCurrentUser(id: string): Promise<any> {
    const user = await this.userModel
      .findById(id)
      .select('-password -refreshToken -emailVerifiedAt -passwordResetToken -passwordResetExpiresAt')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByIdPublic(id: string, viewerUserId?: string, viewerRole?: string): Promise<any> {
    const user = await this.userModel
      .findById(id)
      .select('-password -refreshToken -emailVerifiedAt -passwordResetToken -passwordResetExpiresAt')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isOwner = viewerUserId && user._id.toString() === viewerUserId;
    const isAdminViewer = viewerRole === 'Admin';

    if ((user.role === 'Admin' || !user.isActive) && !isOwner && !isAdminViewer) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async findByPasswordResetToken(tokenHash: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({
        passwordResetToken: tokenHash,
        passwordResetExpiresAt: { $gt: new Date() },
      })
      .exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument> {
    const safeUpdate: UpdateUserDto = {
      ...updateUserDto,
      preferences: updateUserDto.preferences
        ? {
            emailNotifications: updateUserDto.preferences.emailNotifications,
            marketingEmails: updateUserDto.preferences.marketingEmails,
            language: updateUserDto.preferences.language,
          }
        : undefined,
      profile: updateUserDto.profile
        ? {
            phone: updateUserDto.profile.phone,
            website: updateUserDto.profile.website,
            linkedin: updateUserDto.profile.linkedin,
            industries: updateUserDto.profile.industries,
            investmentRange: updateUserDto.profile.investmentRange,
            manufacturingCapacity: updateUserDto.profile.manufacturingCapacity,
            expertise: updateUserDto.profile.expertise,
          }
        : undefined,
    };

    delete (safeUpdate as any).verified;
    delete (safeUpdate as any).isActive;
    delete (safeUpdate as any).role;
    delete (safeUpdate as any).email;
    delete (safeUpdate as any).favoritePatents;

    const user = await this.userModel
      .findByIdAndUpdate(id, safeUpdate, { new: true })
      .select('-password -refreshToken -passwordResetToken -passwordResetExpiresAt')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, {
      lastLoginAt: new Date(),
    });
  }

  async updateRefreshToken(id: string, refreshToken: string | null): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, {
      refreshToken,
    });
  }

  async setPasswordResetToken(
    id: string,
    passwordResetToken: string,
    passwordResetExpiresAt: Date,
  ): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, {
      passwordResetToken,
      passwordResetExpiresAt,
    });
  }

  async clearPasswordResetToken(id: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, {
      passwordResetToken: null,
      passwordResetExpiresAt: null,
    });
  }

  async updatePassword(id: string, password: string): Promise<void> {
    const result = await this.userModel.findByIdAndUpdate(id, {
      password,
      refreshToken: null,
      passwordResetToken: null,
      passwordResetExpiresAt: null,
    });

    if (!result) {
      throw new NotFoundException('User not found');
    }
  }

  async delete(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException('User not found');
    }
  }

  async searchUsers(searchTerm: string, role?: string): Promise<UserDocument[]> {
    const query: any = {
      role: role || { $ne: 'Admin' },
      isActive: true,
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
        { company: { $regex: searchTerm, $options: 'i' } },
      ],
    };

    return this.userModel
      .find(query)
      .select('-password -refreshToken -passwordResetToken -passwordResetExpiresAt')
      .limit(20)
      .exec();
  }

  async getUsersByRole(role: string): Promise<UserDocument[]> {
    return this.userModel
      .find({ role, isActive: true })
      .select('-password -refreshToken -passwordResetToken -passwordResetExpiresAt')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getFavoritePatents(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .populate({
        path: 'favoritePatents',
        match: {
          isPublic: true,
          $or: [{ moderationStatus: 'approved' }, { moderationStatus: { $exists: false } }],
        },
        populate: {
          path: 'innovator',
          select: 'name email country avatar company role verified bio profile',
        },
      })
      .select('favoritePatents')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return (user.favoritePatents || []).filter(Boolean);
  }

  async toggleFavoritePatent(userId: string, patentId: string) {
    const [user, patent] = await Promise.all([
      this.userModel.findById(userId).exec(),
      this.patentModel.findById(patentId).exec(),
    ]);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!patent || !patent.isPublic || patent.moderationStatus === 'rejected' || patent.moderationStatus === 'pending_review') {
      throw new NotFoundException('Patent not found');
    }

    if (patent.innovator.toString() === userId) {
      throw new ForbiddenException('You cannot favorite your own patent');
    }

    const exists = (user.favoritePatents || []).some((entry: any) => entry.toString() === patentId);
    user.favoritePatents = exists
      ? (user.favoritePatents || []).filter((entry: any) => entry.toString() !== patentId)
      : [...(user.favoritePatents || []), patent._id as any];

    await user.save();

    return {
      favoritePatentIds: user.favoritePatents.map((entry: any) => entry.toString()),
      isFavorite: !exists,
    };
  }


  async getPublicStats(): Promise<any> {
    const baseQuery = { isActive: true, role: { $ne: 'Admin' } };
    const [total, innovators, investors, manufacturers, countryRows] = await Promise.all([
      this.userModel.countDocuments(baseQuery),
      this.userModel.countDocuments({ ...baseQuery, role: 'Innovator' }),
      this.userModel.countDocuments({ ...baseQuery, role: 'Investor' }),
      this.userModel.countDocuments({ ...baseQuery, role: 'Manufacturer' }),
      this.userModel.aggregate([
        { $match: baseQuery },
        { $match: { country: { $nin: [null, ''] } } },
        { $group: { _id: '$country' } },
      ]),
    ]);

    return {
      total,
      innovators,
      investors,
      manufacturers,
      countries: countryRows.length,
    };
  }

  async getStats(): Promise<any> {
    const publicRolesQuery = { role: { $in: ['Innovator', 'Investor', 'Manufacturer'] } };
    const totalUsers = await this.userModel.countDocuments(publicRolesQuery);
    const innovators = await this.userModel.countDocuments({ role: 'Innovator' });
    const investors = await this.userModel.countDocuments({ role: 'Investor' });
    const manufacturers = await this.userModel.countDocuments({ role: 'Manufacturer' });
    const verified = await this.userModel.countDocuments({ ...publicRolesQuery, verified: true });

    return {
      total: totalUsers,
      innovators,
      investors,
      manufacturers,
      verified,
      unverified: totalUsers - verified,
    };
  }
}
