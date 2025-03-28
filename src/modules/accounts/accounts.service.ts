import {
  ConflictException,
  Injectable,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { AccountRepository } from './accounts.repository';
import { LoggerService } from '../logger/logger.service';
import { AccountsMapper } from './accounts.mapper';
import { CreateAccountInput, UpdateAccountInput } from './dtos/account.dto';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { AccountEntity } from './accounts.entity';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AccountService {
  constructor(
    private readonly logger: LoggerService,
    private readonly repository: AccountRepository,
    private readonly db: DatabaseService,
  ) {}

  async findAll() {
    try {
      this.logger.info({}, 'services > accounts > findAll > params');

      const accounts = await this.db.users.findMany({
        include: {
          skills: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      this.logger.info({}, 'services > accounts > findAll > success');

      return accounts;
    } catch (error) {
      this.logger.error(error, 'services > accounts > findAll > exception');
      throw error;
    }
  }

  async findById(id: string) {
    try {
      this.logger.info({}, 'services > accounts > findById > params');

      const accountById = await this.db.users.findUnique({
        where: {
          id,
        },
      });

      if (!accountById) {
        throw new NotFoundException('Accounts not found');
      }

      this.logger.info(accountById, 'accountById');

      return accountById; //depois precisa adicionar o mapper para a entidade não devolver a senha.
    } catch (error) {
      this.logger.error(error, 'services > accounts > findById > exception');
      throw error;
    }
  }

  async findByEmail(email: string) {
    try {
      this.logger.info({}, 'services > accounts > findByEmail > params');

      const accountByEmail = await this.db.users.findUnique({
        where: { email },
      });

      if (!accountByEmail) {
        return undefined;
      }

      this.logger.info(accountByEmail, 'accountById');

      return accountByEmail;
    } catch (error) {
      this.logger.error(error, 'services > accounts > findByEmail > exception');
      throw error;
    }
  }

  async create(input: CreateAccountInput) {
    try {
      this.logger.info(input, 'services > account > create > params');

      const emailExists = await this.findByEmail(input.email);

      if (emailExists) {
        throw new ConflictException('Email already exists');
      }

      const password = await bcrypt.hash(input.password, 10);

      const newAccount = await this.db.users.create({
        data: {
          id: randomUUID(),
          email: input.email,
          name: input.name,
          password,
        },
      });

      this.logger.info({}, 'services > accounts > create > success');

      return newAccount;
    } catch (error) {
      this.logger.error(error, 'services > accounts > create > exception');
      throw error;
    }
  }

  async update(id: string, input: UpdateAccountInput) {
    try {
      this.logger.info(
        { id, ...input },
        'services > accounts > update > params',
      );

      const account = await this.repository.findById(id);

      this.logger.info(account, 'account');

      if (!account) {
        throw new NotFoundException('Account not found');
      }

      Object.assign(account, input);

      await this.db.users.update({
        data: {
          ...input,
        },
        where: {
          id,
        },
      });

      this.logger.info({}, 'services > accounts > update > success');
    } catch (error) {
      this.logger.error(error, 'services > accounts > update > exception');
      throw error;
    }
  }

  async delete(id: string) {
    try {
      this.logger.info({ id }, 'services > accounts > delete > params');

      await this.db.users.delete({
        where: {
          id,
        },
      });

      this.logger.info({}, 'services > accounts > delete > success');
    } catch (error) {
      this.logger.error(error, 'services > accounts > delete > exception');
      throw error;
    }
  }
}
