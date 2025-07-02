import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AccountService } from '../accounts/accounts.service';
import { JwtService } from '@nestjs/jwt';
import { LoginAccountInput } from '../accounts/dtos/account.dto';
import { BCRYPT_PROVIDER } from './bcrypt.provider';
//import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly accountService: AccountService,
    private readonly jwtService: JwtService,
    @Inject(BCRYPT_PROVIDER) private readonly bcrypt: typeof import ('bcrypt'),
  ) {}

  async login(loginAccount: LoginAccountInput) {
    const account = await this.accountService.findByEmail(loginAccount.email);
    if (!account) {
      throw new UnauthorizedException('User or password is invalid');
    }

    const validatePassword = await this.bcrypt.compare(
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
          secret: "CHAVEJWT", //process.env.JWT_SECRET,
          expiresIn: "7d" //process.env.JWT_EXPIRES_IN,
        },
      ),
      account: payload,
    };
  }
}
