import { JwtStrategy } from './jwt.strategy';
import { UnauthorizedException } from '@nestjs/common';
import { AccountService } from 'src/modules/accounts/accounts.service';
import { JwtPayload } from './jwt.payload'; // Assumindo que JwtPayload é definido aqui

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let accountService: AccountService;

  beforeEach(() => {
    // Mock do AccountService
    accountService = {
      findByEmail: jest.fn(),
    } as any;

    jwtStrategy = new JwtStrategy(accountService);
  });

  it('should be defined', () => {
    expect(jwtStrategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return the account if user exists', async () => {
      const email = 'test@example.com';
      const payload: JwtPayload = { email };
      const mockAccount = { id: '1', email, name: 'Test User' };

      (accountService.findByEmail as jest.Mock).mockResolvedValue(mockAccount);

      const result = await jwtStrategy.validate(payload);

      expect(accountService.findByEmail).toHaveBeenCalledWith(email);
      expect(result).toEqual(mockAccount);
    });

    it('should throw UnauthorizedException if user does not exist', async () => {
      const email = 'nonexistent@example.com';
      const payload: JwtPayload = { email };

      (accountService.findByEmail as jest.Mock).mockResolvedValue(undefined);

      await expect(jwtStrategy.validate(payload)).rejects.toThrow(UnauthorizedException);
      await expect(jwtStrategy.validate(payload)).rejects.toThrow('user or password is invalid');
      expect(accountService.findByEmail).toHaveBeenCalledWith(email);
    });
  });
});