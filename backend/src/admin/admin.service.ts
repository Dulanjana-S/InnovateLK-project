import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Patent, PatentDocument } from '../patents/schemas/patent.schema';
import { Investment, InvestmentDocument } from '../investments/schemas/investment.schema';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { AdminModeratePatentDto } from './dto/admin-moderate-patent.dto';
import { AdminUpdateInvestmentDto } from './dto/admin-update-investment.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Patent.name) private readonly patentModel: Model<PatentDocument>,
    @InjectModel(Investment.name) private readonly investmentModel: Model<InvestmentDocument>,
  ) {}

  async getOverview() {
    const [
      totalUsers,
      activeUsers,
      verifiedUsers,
      pendingPatents,
      approvedPatents,
      rejectedPatents,
      totalInvestments,
      activeInvestments,
      pendingInvestments,
      investmentVolume,
      usersByRole,
      patentsByModeration,
      patentsByCategory,
      investmentsByStatus,
      recentUsers,
      recentPatents,
      recentInvestments,
    ] = await Promise.all([
      this.userModel.countDocuments({ role: { $ne: 'Admin' } }),
      this.userModel.countDocuments({ role: { $ne: 'Admin' }, isActive: true }),
      this.userModel.countDocuments({ role: { $ne: 'Admin' }, verified: true }),
      this.patentModel.countDocuments({ moderationStatus: 'pending_review' }),
      this.patentModel.countDocuments({
        $or: [{ moderationStatus: 'approved' }, { moderationStatus: { $exists: false } }],
      }),
      this.patentModel.countDocuments({ moderationStatus: 'rejected' }),
      this.investmentModel.countDocuments(),
      this.investmentModel.countDocuments({ status: 'active' }),
      this.investmentModel.countDocuments({ status: 'pending' }),
      this.investmentModel.aggregate([
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      this.userModel.aggregate([
        { $match: { role: { $ne: 'Admin' } } },
        { $group: { _id: '$role', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      this.patentModel.aggregate([
        {
          $project: {
            moderationStatus: { $ifNull: ['$moderationStatus', 'approved'] },
          },
        },
        { $group: { _id: '$moderationStatus', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      this.patentModel.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),
      this.investmentModel.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 }, amount: { $sum: '$amount' } } },
        { $sort: { count: -1 } },
      ]),
      this.userModel
        .find({ role: { $ne: 'Admin' } })
        .select('name email role verified isActive createdAt company country')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      this.patentModel
        .find({})
        .select('title category status moderationStatus isFeatured isPublic createdAt innovatorName')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      this.investmentModel
        .find({})
        .populate('patent', 'title')
        .populate('investor', 'name email company')
        .populate('innovator', 'name email company')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    return {
      summary: {
        totalUsers,
        activeUsers,
        verifiedUsers,
        patentsPendingApproval: pendingPatents,
        approvedPatents,
        rejectedPatents,
        totalInvestments,
        activeInvestments,
        pendingInvestments,
        investmentVolume: investmentVolume[0]?.total || 0,
      },
      charts: {
        usersByRole: usersByRole.map((item) => ({ label: item._id, value: item.count })),
        patentsByModeration: patentsByModeration.map((item) => ({ label: item._id, value: item.count })),
        patentsByCategory: patentsByCategory.map((item) => ({ label: item._id, value: item.count })),
        investmentsByStatus: investmentsByStatus.map((item) => ({ label: item._id, value: item.count, amount: item.amount })),
      },
      recent: {
        users: recentUsers,
        patents: recentPatents,
        investments: recentInvestments,
      },
    };
  }

  async getUsers(filters: { role?: string; search?: string; verified?: string; isActive?: string }) {
    const query: any = { role: { $ne: 'Admin' } };

    if (filters.role) {
      query.role = filters.role;
    }

    if (filters.verified === 'true' || filters.verified === 'false') {
      query.verified = filters.verified === 'true';
    }

    if (filters.isActive === 'true' || filters.isActive === 'false') {
      query.isActive = filters.isActive === 'true';
    }

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
        { company: { $regex: filters.search, $options: 'i' } },
        { country: { $regex: filters.search, $options: 'i' } },
      ];
    }

    return this.userModel
      .find(query)
      .select('-password -refreshToken -passwordResetToken -passwordResetExpiresAt')
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateUser(userId: string, dto: AdminUpdateUserDto) {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        {
          ...(dto.verified !== undefined ? { verified: dto.verified } : {}),
          ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        },
        { new: true },
      )
      .select('-password -refreshToken -passwordResetToken -passwordResetExpiresAt')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getPatents(filters: { moderationStatus?: string; status?: string; search?: string }) {
    const query: any = {};

    if (filters.moderationStatus) {
      query.moderationStatus = filters.moderationStatus;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { patentNumber: { $regex: filters.search, $options: 'i' } },
        { innovatorName: { $regex: filters.search, $options: 'i' } },
        { category: { $regex: filters.search, $options: 'i' } },
      ];
    }

    return this.patentModel
      .find(query)
      .populate('innovator', 'name email role company country verified')
      .populate('reviewedBy', 'name email role')
      .sort({ createdAt: -1 })
      .exec();
  }

  async moderatePatent(patentId: string, dto: AdminModeratePatentDto, adminUserId: string) {
    const patent = await this.patentModel.findById(patentId).exec();

    if (!patent) {
      throw new NotFoundException('Patent not found');
    }

    if (dto.moderationStatus) {
      patent.moderationStatus = dto.moderationStatus;
      patent.reviewedBy = adminUserId as any;
      patent.reviewedAt = new Date();

      if (dto.moderationStatus === 'approved') {
        patent.isPublic = dto.isPublic ?? true;
      }

      if (dto.moderationStatus === 'rejected') {
        patent.isPublic = false;
      }
    }

    if (dto.adminNotes !== undefined) {
      patent.adminNotes = dto.adminNotes;
    }

    if (dto.isFeatured !== undefined) {
      patent.isFeatured = dto.isFeatured;
    }

    if (dto.status) {
      patent.status = dto.status;
    }

    if (dto.isPublic !== undefined && patent.moderationStatus !== 'rejected') {
      patent.isPublic = dto.isPublic;
    }

    await patent.save();

    return this.patentModel
      .findById(patentId)
      .populate('innovator', 'name email role company country verified')
      .populate('reviewedBy', 'name email role')
      .exec();
  }

  async getInvestments(filters: { status?: string; search?: string }) {
    const query: any = {};

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.search) {
      const [patents, users] = await Promise.all([
        this.patentModel
          .find({ title: { $regex: filters.search, $options: 'i' } })
          .select('_id')
          .lean(),
        this.userModel
          .find({
            $or: [
              { name: { $regex: filters.search, $options: 'i' } },
              { email: { $regex: filters.search, $options: 'i' } },
              { company: { $regex: filters.search, $options: 'i' } },
            ],
          })
          .select('_id')
          .lean(),
      ]);

      const patentIds = patents.map((patent) => patent._id);
      const userIds = users.map((item) => item._id);

      query.$or = [
        { patent: { $in: patentIds } },
        { investor: { $in: userIds } },
        { innovator: { $in: userIds } },
      ];
    }

    return this.investmentModel
      .find(query)
      .populate('patent', 'title category fundingRequired investmentStage image')
      .populate('investor', 'name email avatar company country role')
      .populate('innovator', 'name email avatar company country role')
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateInvestment(investmentId: string, dto: AdminUpdateInvestmentDto) {
    const investment = await this.investmentModel.findById(investmentId).exec();

    if (!investment) {
      throw new NotFoundException('Investment not found');
    }

    Object.assign(investment, dto);
    await investment.save();

    return this.investmentModel
      .findById(investmentId)
      .populate('patent', 'title category fundingRequired investmentStage image')
      .populate('investor', 'name email avatar company country role')
      .populate('innovator', 'name email avatar company country role')
      .exec();
  }

  async getAnalytics() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const [userGrowth, patentGrowth, investmentGrowth] = await Promise.all([
      this.userModel.aggregate([
        { $match: { role: { $ne: 'Admin' }, createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      this.patentModel.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      this.investmentModel.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            count: { $sum: 1 },
            amount: { $sum: '$amount' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ]);

    return {
      ...(await this.getOverview()),
      growth: {
        users: userGrowth.map((item) => ({
          label: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
          value: item.count,
        })),
        patents: patentGrowth.map((item) => ({
          label: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
          value: item.count,
        })),
        investments: investmentGrowth.map((item) => ({
          label: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
          value: item.count,
          amount: item.amount,
        })),
      },
    };
  }
}
