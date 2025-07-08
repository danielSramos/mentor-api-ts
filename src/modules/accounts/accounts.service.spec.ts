import { Test, TestingModule } from '@nestjs/testing';
import { AccountService } from './accounts.service';
import { DatabaseService } from '../database/database.service';
import { LoggerService } from '../logger/logger.service';
import { CreateAccountInput, UpdateAccountInput } from './dtos/account.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

jest.mock('bcrypt');
jest.mock('crypto', () => {
  const actual = jest.requireActual('crypto'); 
  return {
    ...actual, 
    randomUUID: jest.fn(() => 'mock-uuid'), 
  };
});

describe('AccountService', () => {
  let service: AccountService;
  let databaseService: DatabaseService;
  let loggerService: LoggerService;
  let module: TestingModule;

  const mockUsers = {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        AccountService,
        {
          provide: LoggerService,
          useValue: {
            info: jest.fn(),
            error: jest.fn(),
          },
        },
        {
          provide: DatabaseService,
          useValue: {
            users: mockUsers,
          },
        },
      ],
    }).compile();

    service = module.get<AccountService>(AccountService);
    databaseService = module.get<DatabaseService>(DatabaseService);
    loggerService = module.get<LoggerService>(LoggerService);

    for (const mockFn of Object.values(mockUsers)) {
      (mockFn as jest.Mock).mockClear();
    }
    (loggerService.info as jest.Mock).mockClear();
    (loggerService.error as jest.Mock).mockClear();
    (bcrypt.hash as jest.Mock).mockClear();
    (randomUUID as jest.Mock).mockClear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all accounts', async () => {
      const mockAccounts = [{ id: '1', name: 'User 1' }, { id: '2', name: 'User 2' }];
      mockUsers.findMany.mockResolvedValue(mockAccounts);

      const result = await service.findAll();

      expect(mockUsers.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          company: true,
          position: true,
          nationality: true,
          verified: true,
          description: true,
          profile_img_url: true,
          created_at: true,
          updated_at: true,
          skills: {
            select: {
              id: true,
              name: true,
            }
          }
        },
      });
      expect(result).toEqual(mockAccounts);
      expect(loggerService.info).toHaveBeenCalledWith({}, 'services > accounts > findAll > params');
      expect(loggerService.info).toHaveBeenCalledWith({}, 'services > accounts > findAll > success');
    });

    it('should throw an error if database call fails', async () => {
      const error = new Error('DB error');
      mockUsers.findMany.mockRejectedValue(error);

      await expect(service.findAll()).rejects.toThrow(error);
      expect(loggerService.error).toHaveBeenCalledWith(error, 'services > accounts > findAll > exception');
    });
  });

  describe('findById', () => {
    it('should return an account by id', async () => {
      const mockAccount = { id: '1', name: 'User 1' };
      mockUsers.findUnique.mockResolvedValue(mockAccount);

      const result = await service.findById('1');

      expect(mockUsers.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual(mockAccount);
      expect(loggerService.info).toHaveBeenCalledWith({}, 'services > accounts > findById > params');
      expect(loggerService.info).toHaveBeenCalledWith(mockAccount, 'accountById');
    });

    it('should throw NotFoundException if account not found', async () => {
      mockUsers.findUnique.mockResolvedValue(undefined);

      await expect(service.findById('non-existent-id')).rejects.toThrow(NotFoundException);
      await expect(service.findById('non-existent-id')).rejects.toThrow('Accounts not found');
      expect(loggerService.error).toHaveBeenCalledWith(expect.any(NotFoundException), 'services > accounts > findById > exception');
    });

    it('should throw an error if database call fails', async () => {
      const error = new Error('DB error');
      mockUsers.findUnique.mockRejectedValue(error);

      await expect(service.findById('1')).rejects.toThrow(error);
      expect(loggerService.error).toHaveBeenCalledWith(error, 'services > accounts > findById > exception');
    });
  });

  describe('findByEmail', () => {
    it('should return an account by email', async () => {
      const mockAccount = { id: '1', email: 'test@example.com' };
      mockUsers.findUnique.mockResolvedValue(mockAccount);

      const result = await service.findByEmail('test@example.com');

      expect(mockUsers.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(result).toEqual(mockAccount);
      expect(loggerService.info).toHaveBeenCalledWith({}, 'services > accounts > findByEmail > params');
      expect(loggerService.info).toHaveBeenCalledWith(mockAccount, 'accountById');
    });

    it('should return undefined if account not found', async () => {
      mockUsers.findUnique.mockResolvedValue(undefined);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeUndefined();
      expect(loggerService.info).toHaveBeenCalledWith({}, 'services > accounts > findByEmail > params');
    });

    it('should throw an error if database call fails', async () => {
      const error = new Error('DB error');
      mockUsers.findUnique.mockRejectedValue(error);

      await expect(service.findByEmail('test@example.com')).rejects.toThrow(error);
      expect(loggerService.error).toHaveBeenCalledWith(error, 'services > accounts > findByEmail > exception');
    });
  });

  describe('create', () => {
    const createInput: CreateAccountInput = {
      name: 'New User',
      email: 'new@example.com',
      password: 'password123',
    };
    const hashedPassword = 'hashedPassword';

    beforeEach(() => {
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
    });

    it('should create a new account', async () => {
      jest.spyOn(service, 'findByEmail').mockResolvedValue(undefined);
      mockUsers.create.mockResolvedValue({
        id: 'mock-uuid',
        ...createInput,
        password: hashedPassword,
      });

      const result = await service.create(createInput);

      expect(service.findByEmail).toHaveBeenCalledWith(createInput.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(createInput.password, 10);
      expect(mockUsers.create).toHaveBeenCalledWith({
        data: {
          id: 'mock-uuid',
          email: createInput.email,
          name: createInput.name,
          password: hashedPassword,
        },
      });
      expect(result).toEqual({
        id: 'mock-uuid',
        ...createInput,
        password: hashedPassword,
      });
      expect(loggerService.info).toHaveBeenCalledWith(createInput, 'services > account > create > params');
      expect(loggerService.info).toHaveBeenCalledWith({}, 'services > accounts > create > success');
    });

    it('should throw ConflictException if email already exists', async () => {
      jest.spyOn(service, 'findByEmail').mockResolvedValue({
        id: 'some-existing-id',
        name: 'Existing User',
        email: createInput.email,
        password: 'hashedExistingPassword',
        username: 'existingusername',
        company: null,
        position: null,
        nationality: null,
        verified: true,
        description: null,
        profile_img_url: null,
        created_at: new Date(),
        updated_at: new Date(),
      });

      await expect(service.create(createInput)).rejects.toThrow(ConflictException);
      await expect(service.create(createInput)).rejects.toThrow('Email already exists');
      expect(service.findByEmail).toHaveBeenCalledWith(createInput.email);
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(mockUsers.create).not.toHaveBeenCalled();
      expect(loggerService.error).toHaveBeenCalledWith(expect.any(ConflictException), 'services > accounts > create > exception');
    });

    it('should throw an error if database creation fails', async () => {
      const error = new Error('DB create error');
      jest.spyOn(service, 'findByEmail').mockResolvedValue(undefined);
      mockUsers.create.mockRejectedValue(error);

      await expect(service.create(createInput)).rejects.toThrow(error);
      expect(loggerService.error).toHaveBeenCalledWith(error, 'services > accounts > create > exception');
    });
  });

  describe('update', () => {
    const accountId = 'account-id-to-update';
    const updateInput: UpdateAccountInput = {
      name: 'Updated Name',
      phoneNumber: '987654321',
    };
    const existingAccount = {
      id: accountId,
      name: 'Old Name',
      email: 'old@example.com',
      password: 'oldHashedPassword',
      username: 'oldusername',
      company: 'Old Company',
      position: 'Old Position',
      nationality: 'Old Nationality',
      verified: true,
      description: 'Old description',
      profile_img_url: 'http://old.com/img.png',
      created_at: new Date(),
      updated_at: new Date(),
    };

    it('should update an existing account', async () => {
      mockUsers.findUnique.mockResolvedValue(existingAccount);
      mockUsers.update.mockResolvedValue({ ...existingAccount, ...updateInput });

      await service.update(accountId, updateInput);

      expect(mockUsers.findUnique).toHaveBeenCalledWith({ where: { id: accountId } });
      expect(mockUsers.update).toHaveBeenCalledWith({
        data: {
          ...updateInput,
        },
        where: { id: accountId },
      });
      expect(loggerService.info).toHaveBeenCalledWith({ id: accountId, ...updateInput }, 'services > accounts > update > params');
      expect(loggerService.info).toHaveBeenCalledWith(existingAccount, 'account');
      expect(loggerService.info).toHaveBeenCalledWith({}, 'services > accounts > update > success');
    });

    it('should throw NotFoundException if account not found for update', async () => {
      mockUsers.findUnique.mockResolvedValue(undefined);

      await expect(service.update(accountId, updateInput)).rejects.toThrow(NotFoundException);
      await expect(service.update(accountId, updateInput)).rejects.toThrow('Account not found');
      expect(mockUsers.findUnique).toHaveBeenCalledWith({ where: { id: accountId } });
      expect(mockUsers.update).not.toHaveBeenCalled();
      expect(loggerService.error).toHaveBeenCalledWith(expect.any(NotFoundException), 'services > accounts > update > exception');
    });

    it('should throw an error if database update fails', async () => {
      const error = new Error('DB update error');
      mockUsers.findUnique.mockResolvedValue(existingAccount);
      mockUsers.update.mockRejectedValue(error);

      await expect(service.update(accountId, updateInput)).rejects.toThrow(error);
      expect(loggerService.error).toHaveBeenCalledWith(error, 'services > accounts > update > exception');
    });
  });

  describe('delete', () => {
    const accountId = 'account-id-to-delete';

    it('should delete an account', async () => {
      mockUsers.delete.mockResolvedValue({ count: 1 }); 

      await service.delete(accountId);

      expect(mockUsers.delete).toHaveBeenCalledWith({ where: { id: accountId } });
      expect(loggerService.info).toHaveBeenCalledWith({ id: accountId }, 'services > accounts > delete > params');
      expect(loggerService.info).toHaveBeenCalledWith({}, 'services > accounts > delete > success');
    });

    it('should throw an error if database delete fails', async () => {
      const error = new Error('DB delete error');
      mockUsers.delete.mockRejectedValue(error);

      await expect(service.delete(accountId)).rejects.toThrow(error);
      expect(loggerService.error).toHaveBeenCalledWith(error, 'services > accounts > delete > exception');
    });
  });
});