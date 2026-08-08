import { userRepository } from '../repository/user.repository';
import { UpdateProfileDTO, UserListQueryDTO } from '../dto/user.dto';
import { USER_ERRORS } from '../constants/user.constants';
import {
  ForbiddenError,
  NotFoundError,
} from '../../../utils/errors';
import { walletService } from '../../wallet/service/wallet.service';

const sanitizeProfile = (user: any) => {
  const profile = { ...user };
  delete profile.password;
  if (profile.sponsor) {
    profile.sponsor = { ...profile.sponsor };
    delete profile.sponsor.password;
  }
  return profile;
};

export class UserService {
  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError(USER_ERRORS.USER_NOT_FOUND);
    return sanitizeProfile(user);
  }

  async updateProfile(userId: string, data: UpdateProfileDTO) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError(USER_ERRORS.USER_NOT_FOUND);

    if (data.walletAddress && data.walletAddress !== user.walletAddress) {
      const existing = await userRepository.findByEmail(data.walletAddress);
      // Simplified uniqueness check not used
    }

    const updated = await userRepository.update(userId, {
      name: data.name,
      phone: data.phone,
      country: data.country,
      walletAddress: data.walletAddress,
    });
    return sanitizeProfile(updated);
  }

  async toggleAutoTrade(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError(USER_ERRORS.USER_NOT_FOUND);
    const updated = await userRepository.toggleAutoTrade(userId);
    const { password, ...profile } = updated as any;
    return { autoTradeStatus: profile.autoTradeStatus };
  }

  async getDashboard(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError(USER_ERRORS.USER_NOT_FOUND);

    const summary = await userRepository.getDashboardSummary(userId);
    const walletMap = await walletService.getWalletBalances(userId);

    return {
      profile: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        country: user.country,
        role: user.role,
        referralCode: user.referralCode,
        walletAddress: user.walletAddress,
        rank: user.rank,
        autoTradeStatus: user.autoTradeStatus,
        status: user.status,
        isContentCreator: user.isContentCreator,
        sponsorTradeBonusExpiry: user.sponsorTradeBonusExpiry,
        sponsorTradeBonusRate: user.sponsorTradeBonusRate,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
      wallets: walletMap,
      directReferrals: summary.directReferrals,
      teamSize: summary.teamSize,
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalReferrals: summary.teamSize,
    };
  }

  async listUsers(query: UserListQueryDTO, requestingUserId: string) {
    const requester = await userRepository.findById(requestingUserId);
    if (!requester || requester.role !== 'ADMIN') {
      throw new ForbiddenError(USER_ERRORS.UNAUTHORIZED);
    }

    return userRepository.findAll({
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 20,
      search: query.search,
      role: query.role,
      status: query.status,
    });
  }
}

export const userService = new UserService();
