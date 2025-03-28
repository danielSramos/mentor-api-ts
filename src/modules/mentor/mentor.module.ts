import { Module } from '@nestjs/common';
import { LoggerModule } from '../logger/logger.module';
import { DatabaseModule } from '../database/database.module';
import { MentorService } from './mentor.service';
import { LoggerService } from '../logger/logger.service';
import { DatabaseService } from '../database/database.service';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { MentorController } from './mentor.controller';
import { CreateSkills } from './dtos/mentor.dto';

@Module({
  imports: [LoggerModule, DatabaseModule],
  providers: [MentorService, LoggerService, DatabaseService, CreateSkills],
  controllers: [MentorController],
})
export class MentorModule {}
