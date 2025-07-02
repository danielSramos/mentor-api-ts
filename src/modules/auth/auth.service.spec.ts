import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AccountService } from '../accounts/accounts.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { LoginAccountInput } from '../accounts/dtos/account.dto';
import { BCRYPT_PROVIDER } from './bcrypt.provider';

describe('AuthService', () => {
  let authService: AuthService;
  let accountService: AccountService;
  let jwtService: JwtService;

  const mockBcryptCompare = jest.fn();
  const mockBcryptHash = jest.fn();

  beforeEach(async () => {
    process.env.JWT_SECRET = 'CHAVEJWT';
    process.env.JWT_EXPIRES_IN = '7d';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: AccountService, useValue: { findByEmail: jest.fn() } },
        { provide: JwtService, useValue: { sign: jest.fn() } },
        {
          // >>>>> MUDE ISSO AQUI <<<<<
          // Use o BCRYPT_PROVIDER importado, não a string literal 'bcrypt'
          provide: BCRYPT_PROVIDER,
          useValue: {
            compare: mockBcryptCompare,
            hash: mockBcryptHash,
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    accountService = module.get<AccountService>(AccountService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('login', () => {
    it('should return an access token and account on successful login', async () => {
      // DECLARE loginInput, hashedPassword, mockAccount DENTRO DE CADA IT
      const loginInput = { email: 'test@example.com', password: 'plainPassword' };
      const hashedPassword = 'hashedPassword123';
      const mockAccount = {
        id: '1', name: 'Test User', email: loginInput.email, password: hashedPassword,
        username: 'testuser', company: null, created_at: new Date('2025-07-01T19:44:23.021Z'),
        description: null, nationality: null, position: null, profile_img_url: null,
        updated_at: new Date('2025-07-01T19:44:23.021Z'), verified: true,
      };

      (accountService.findByEmail as jest.Mock).mockResolvedValue(mockAccount);
      mockBcryptCompare.mockResolvedValue(true);
      (jwtService.sign as jest.Mock).mockReturnValue('mockAccessToken');

      const result = await authService.login(loginInput);

      expect(accountService.findByEmail).toHaveBeenCalledWith(loginInput.email);
      expect(mockBcryptCompare).toHaveBeenCalledWith(loginInput.password, hashedPassword);
      expect(jwtService.sign).toHaveBeenCalledWith(
        { email: loginInput.email },
        { secret: 'CHAVEJWT', expiresIn: '7d' },
      );
      expect(result).toEqual({
        access_token: 'mockAccessToken',
        account: {
          email: mockAccount.email, id: mockAccount.id, name: mockAccount.name,
          company: mockAccount.company, created_at: mockAccount.created_at,
          description: mockAccount.description, nationality: mockAccount.nationality,
          position: mockAccount.position, profile_img_url: mockAccount.profile_img_url,
          updated_at: mockAccount.updated_at, username: mockAccount.username, verified: mockAccount.verified,
        },
      });
    });

    it('should throw UnauthorizedException if password validation fails', async () => {
      // DECLARE loginInput, hashedPassword, mockAccount DENTRO DE CADA IT
      const loginInput = { email: 'test@example.com', password: 'plainPassword' };
      const hashedPassword = 'hashedPassword123';
      const mockAccount = {
        id: '1', name: 'Test User', email: loginInput.email, password: hashedPassword,
        username: 'testuser', company: null, created_at: new Date('2025-07-01T19:44:23.021Z'),
        description: null, nationality: null, position: null, profile_img_url: null,
        updated_at: new Date('2025-07-01T19:44:23.021Z'), verified: true,
      };

      (accountService.findByEmail as jest.Mock).mockResolvedValue(mockAccount);
      mockBcryptCompare.mockResolvedValue(false);

      await expect(authService.login(loginInput)).rejects.toThrow(UnauthorizedException);
      await expect(authService.login(loginInput)).rejects.toThrow('User or password is invalid');
      expect(accountService.findByEmail).toHaveBeenCalledWith(loginInput.email);
      expect(mockBcryptCompare).toHaveBeenCalledWith(loginInput.password, hashedPassword);
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if account is not found', async () => {
      // DECLARE loginInput, hashedPassword, mockAccount DENTRO DE CADA IT
      const loginInput = { email: 'test@example.com', password: 'plainPassword' };
      const hashedPassword = 'hashedPassword123'; // Pode ser removido, não é usado neste caso específico, mas manter é inofensivo
      const mockAccount = { // Este mockAccount não será usado para simular 'not found', mas a declaração é mantida por consistência
        id: '1', name: 'Test User', email: loginInput.email, password: hashedPassword,
        username: 'testuser', company: null, created_at: new Date('2025-07-01T19:44:23.021Z'),
        description: null, nationality: null, position: null, profile_img_url: null,
        updated_at: new Date('2025-07-01T19:44:23.021Z'), verified: true,
      };

      (accountService.findByEmail as jest.Mock).mockResolvedValue(null);
      mockBcryptCompare.mockResolvedValue(false);

      await expect(authService.login(loginInput)).rejects.toThrow(UnauthorizedException);
      await expect(authService.login(loginInput)).rejects.toThrow('User or password is invalid');
      expect(accountService.findByEmail).toHaveBeenCalledWith(loginInput.email);
      expect(mockBcryptCompare).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('tokenGenerate', () => {
    it('should generate a token and return account info without password', async () => {
      const payload = {
        email: 'test@example.com',
        password: 'anyPassword',
        id: 'someId',
        name: 'Test User',
      };
      (jwtService.sign as jest.Mock).mockReturnValue('mockAccessToken');

      const result = await authService.tokenGenerate(payload);

      expect(jwtService.sign).toHaveBeenCalledWith(
        { email: payload.email },
        { secret: 'CHAVEJWT', expiresIn: '7d' },
      );
      expect(result).toEqual({
        access_token: 'mockAccessToken',
        account: { email: payload.email, id: payload.id, name: payload.name },
      });
      expect(result.account).not.toHaveProperty('password');
    });
  });
});