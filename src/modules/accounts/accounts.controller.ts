import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import { AccountService } from './accounts.service';
import { get } from 'http';
import { CreateAccountInput, LoginAccountInput } from './dtos/account.dto';
import { JwtAuthGuard } from '../auth/auth.guard';
import { AuthService } from '../auth/auth.service';

@Controller('accounts')
export class AccountController {
  constructor(
    private readonly logger: LoggerService,
    private readonly service: AccountService,
    private readonly authService: AuthService,
  ) {}

  @Post('/login')
  login(@Body() body: LoginAccountInput) {
    this.logger.info({}, 'controller > accounts > login');

    return this.authService.login(body);
  }

  //@UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    this.logger.info({}, 'controller > accounts > findAll');
    return this.service.findAll();
  }

  @Post()
  async create(@Body() body: CreateAccountInput) {
    this.logger.info({}, 'controller > accounts > create');

    await this.service.create(body);
    this.logger.info({}, 'controller > accounts > create > sucess');
  }
}
