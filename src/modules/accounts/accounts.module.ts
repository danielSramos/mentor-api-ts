import { Module } from '@nestjs/common';
import { AccountService } from './accounts.service';
import { AccountController } from './accounts.controller';
import { LoggerModule } from '../logger/logger.module';
import { DatabaseModule } from '../database/database.module';
import { AccountRepository } from './accounts.repository';
import { LoggerService } from '../logger/logger.service';
import { DatabaseService } from '../database/database.service';
import { LoginAccountInput } from './dtos/account.dto';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { bcryptProvider } from '../auth/bcrypt.provider';

@Module({
  imports: [LoggerModule, DatabaseModule],
  providers: [
    AccountService,
    AccountRepository,
    LoggerService,
    DatabaseService,
    LoginAccountInput,
    AuthService,
    JwtService,
    JwtStrategy,
    bcryptProvider
  ],
  controllers: [AccountController],
})
export class AccountModule {}
