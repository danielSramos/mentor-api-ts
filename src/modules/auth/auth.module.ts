import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AccountService } from '../accounts/accounts.service';
import { LoggerService } from '../logger/logger.service';
import { AccountRepository } from '../accounts/accounts.repository';
import { DatabaseService } from '../database/database.service';
import { JwtModule } from '@nestjs/jwt';
import { AccountModule } from '../accounts/accounts.module';
import { bcryptProvider } from './bcrypt.provider';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    JwtModule.register({
      secret: "CHAVEJWT", //process.env.JWT_SECRET,
      signOptions: {
        expiresIn: "7d" //process.env.JWT_EXPIRES_IN,
      },
    }),
    AccountModule,
  ],
  providers: [
    AuthService,
    JwtStrategy,
    AccountService,
    LoggerService,
    AccountRepository,
    DatabaseService,
    bcryptProvider
  ],
})
export class AuthModule {}
