import { Test, TestingModule } from '@nestjs/testing';
import { AccountController } from './accounts.controller';
import { AccountService } from './accounts.service';
import { AuthService } from '../auth/auth.service';
import { LoggerService } from '../logger/logger.service';
import { CreateAccountInput, LoginAccountInput } from './dtos/account.dto';
import { ConflictException } from '@nestjs/common';

describe('AccountController', () => {
  let controller: AccountController;
  let accountService: AccountService;
  let authService: AuthService;
  let loggerService: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [
        {
          provide: AccountService,
          useValue: {
            findAll: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
          },
        },
        {
          provide: LoggerService,
          useValue: {
            info: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AccountController>(AccountController);
    accountService = module.get<AccountService>(AccountService);
    authService = module.get<AuthService>(AuthService);
    loggerService = module.get<LoggerService>(LoggerService);

    jest.clearAllMocks(); // Clear mocks before each test
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return login response on successful login', async () => {
      const loginInput: LoginAccountInput = { email: 'test@example.com', password: 'password' };
      const authResponse = { access_token: 'jwt-token', account: { email: 'test@example.com' } };
      (authService.login as jest.Mock).mockResolvedValue(authResponse);

      const result = await controller.login(loginInput);

      expect(loggerService.info).toHaveBeenCalledWith({}, 'controller > accounts > login');
      expect(authService.login).toHaveBeenCalledWith(loginInput);
      expect(result).toEqual(authResponse);
    });

    it('should throw UnauthorizedException if login fails (propagated from service)', async () => {
      const loginInput: LoginAccountInput = { email: 'wrong@example.com', password: 'wrong' };
      (authService.login as jest.Mock).mockRejectedValue(new Error('Invalid credentials')); // Simulate service throwing error

      await expect(controller.login(loginInput)).rejects.toThrow('Invalid credentials');
      expect(loggerService.info).toHaveBeenCalledWith({}, 'controller > accounts > login');
      expect(authService.login).toHaveBeenCalledWith(loginInput);
    });
  });

  describe('findAll', () => {
    it('should return all accounts', async () => {
      const mockAccounts = [{ id: '1', name: 'User 1' }];
      (accountService.findAll as jest.Mock).mockResolvedValue(mockAccounts);

      const result = await controller.findAll();

      expect(loggerService.info).toHaveBeenCalledWith({}, 'controller > accounts > findAll');
      expect(accountService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockAccounts);
    });

    it('should propagate errors from service', async () => {
      (accountService.findAll as jest.Mock).mockRejectedValue(new Error('Service error'));

      await expect(controller.findAll()).rejects.toThrow('Service error');
      expect(loggerService.info).toHaveBeenCalledWith({}, 'controller > accounts > findAll');
      expect(accountService.findAll).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create an account successfully', async () => {
      const createInput: CreateAccountInput = { name: 'New User', email: 'new@example.com', password: 'password123' };
      (accountService.create as jest.Mock).mockResolvedValue(undefined); // Service returns void

      await controller.create(createInput);

      expect(loggerService.info).toHaveBeenCalledWith({}, 'controller > accounts > create');
      expect(accountService.create).toHaveBeenCalledWith(createInput);
      expect(loggerService.info).toHaveBeenCalledWith({}, 'controller > accounts > create > sucess');
    });

    it('should propagate ConflictException if email already exists', async () => {
      const createInput: CreateAccountInput = { name: 'New User', email: 'existing@example.com', password: 'password123' };
      (accountService.create as jest.Mock).mockRejectedValue(new ConflictException('Email already exists'));

      await expect(controller.create(createInput)).rejects.toThrow(ConflictException);
      await expect(controller.create(createInput)).rejects.toThrow('Email already exists');
      expect(loggerService.info).toHaveBeenCalledWith({}, 'controller > accounts > create');
      expect(accountService.create).toHaveBeenCalledWith(createInput);
      // Logger for success should not be called if an error occurs
      expect(loggerService.info).not.toHaveBeenCalledWith({}, 'controller > accounts > create > sucess');
    });

    it('should propagate other errors from service', async () => {
      const createInput: CreateAccountInput = { name: 'New User', email: 'error@example.com', password: 'password123' };
      (accountService.create as jest.Mock).mockRejectedValue(new Error('Unknown error'));

      await expect(controller.create(createInput)).rejects.toThrow('Unknown error');
      expect(loggerService.info).toHaveBeenCalledWith({}, 'controller > accounts > create');
      expect(accountService.create).toHaveBeenCalledWith(createInput);
      expect(loggerService.info).not.toHaveBeenCalledWith({}, 'controller > accounts > create > sucess');
    });
  });
});