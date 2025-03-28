import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AccountService } from '../accounts/accounts.service';
import { JwtService } from '@nestjs/jwt';
import { LoginAccountInput } from '../accounts/dtos/account.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly accountService: AccountService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginAccount: LoginAccountInput) {
    const account = await this.accountService.findByEmail(loginAccount.email);

    if (!account) {
      throw new UnauthorizedException('User or password is invalid');
    }

    const validatePassword = await bcrypt.compare(
      loginAccount.password,
      account.password,
    );

    if (!validatePassword) {
      throw new UnauthorizedException('User or password is invalid');
    }

    return this.tokenGenerate(account);
  }

  async tokenGenerate(payload: LoginAccountInput) {
    delete payload.password;

    return {
      access_token: this.jwtService.sign(
        { email: payload.email },
        {
          secret: process.env.JWT_SECRET,
          expiresIn: process.env.JWT_EXPIRES_IN,
        },
      ),
      account: payload,
    };
  }
}
