import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const userId = user._id.toString();

    await this.usersService.updateLastLogin(userId);

    const { password: _, ...result } = user.toObject();
    return { ...result, _id: userId };
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    const userId = user._id.toString();

    const payload = {
      sub: userId,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION') || '30d',
    });

    await this.usersService.updateRefreshToken(userId, refreshToken);

    return {
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        role: user.role,
        country: user.country,
        avatar: user.avatar,
        bio: user.bio,
        company: user.company,
        verified: user.verified,
      },
      accessToken,
      refreshToken,
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
      avatar: registerDto.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${registerDto.name}`,
    });

    const userId = user._id.toString();

    const payload = {
      sub: userId,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION') || '30d',
    });

    await this.usersService.updateRefreshToken(userId, refreshToken);

    return {
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        role: user.role,
        country: user.country,
        avatar: user.avatar,
        bio: user.bio,
        company: user.company,
        verified: user.verified,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.usersService.findById(payload.sub);

      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const userId = user._id.toString();

      const newPayload = {
        sub: userId,
        email: user.email,
        role: user.role,
      };

      const accessToken = this.jwtService.sign(newPayload);
      const newRefreshToken = this.jwtService.sign(newPayload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION') || '30d',
      });

      await this.usersService.updateRefreshToken(userId, newRefreshToken);

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (_error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async requestPasswordReset(email: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      return {
        message: 'If an account exists for that email, a reset link has been generated.',
      };
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

    await this.usersService.setPasswordResetToken(user._id.toString(), tokenHash, expiresAt);

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const resetUrl = `${frontendUrl.replace(/\/$/, '')}/forgot-password?token=${rawToken}`;

    await this.sendPasswordResetEmail(user.email, user.name, resetUrl);

    const response: Record<string, any> = {
      message: 'If an account exists for that email, a reset link has been generated.',
    };

    if (this.configService.get<string>('NODE_ENV') !== 'production') {
      response.resetToken = rawToken;
      response.resetUrl = resetUrl;
    }

    return response;
  }

  async resetPassword(token: string, password: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await this.usersService.findByPasswordResetToken(tokenHash);

    if (!user) {
      throw new BadRequestException('Password reset token is invalid or has expired');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await this.usersService.updatePassword(user._id.toString(), hashedPassword);

    return {
      message: 'Password reset successful. You can now log in with your new password.',
    };
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
    return { message: 'Logged out successfully' };
  }

  private async sendPasswordResetEmail(email: string, name: string, resetUrl: string) {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    const from = this.configService.get<string>('MAIL_FROM') || 'InnovateLK <no-reply@innovatelk.local>';

    if (!host || !port || !user || !pass) {
      console.log(`Password reset requested for ${email}. Reset URL: ${resetUrl}`);
      return;
    }

    const transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from,
      to: email,
      subject: 'Reset your InnovateLK password',
      text: `Hello ${name},

Use the following link to reset your password: ${resetUrl}

This link expires in 30 minutes.`,
      html: `<p>Hello ${name},</p><p>Use the following link to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in 30 minutes.</p>`,
    });
  }
}
