import { validate } from 'class-validator';
import { CreateAccountInput, UpdateAccountInput, LoginAccountInput } from './account.dto';

describe('Account DTOs', () => {

  describe('CreateAccountInput', () => {
    it('should validate a valid CreateAccountInput object', async () => {
      const input = new CreateAccountInput();
      input.name = 'Test User';
      input.email = 'test@example.com';
      input.password = 'Password123!';
      const errors = await validate(input);
      expect(errors.length).toBe(0);
    });

    it('should return errors for an invalid CreateAccountInput (missing name)', async () => {
      const input = new CreateAccountInput();
      input.email = 'test@example.com';
      input.password = 'Password123!';
      const errors = await validate(input);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toEqual('name');
    });

    it('should return errors for an invalid CreateAccountInput (invalid email)', async () => {
      const input = new CreateAccountInput();
      input.name = 'Test User';
      input.email = 'invalid-email';
      input.password = 'Password123!';
      const errors = await validate(input);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toEqual('email');
    });

    it('should return errors for an invalid CreateAccountInput (missing password)', async () => {
      const input = new CreateAccountInput();
      input.name = 'Test User';
      input.email = 'test@example.com';
      const errors = await validate(input);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toEqual('password');
    });
  });

  describe('UpdateAccountInput', () => {
    it('should validate a valid UpdateAccountInput object with all optional fields', async () => {
      const input = new UpdateAccountInput();
      input.name = 'Updated Name';
      input.email = 'updated@example.com';
      input.password = 'NewPassword456!';
      input.phoneNumber = '1234567890';
      input.userProfile = 'someProfileId';
      const errors = await validate(input);
      expect(errors.length).toBe(0);
    });

    it('should validate a valid UpdateAccountInput object with only one optional field', async () => {
      const input = new UpdateAccountInput();
      input.name = 'Updated Name';
      const errors = await validate(input);
      expect(errors.length).toBe(0);
    });

    it('should validate an empty UpdateAccountInput object', async () => {
      const input = new UpdateAccountInput();
      const errors = await validate(input);
      expect(errors.length).toBe(0);
    });

    it('should return errors for an invalid UpdateAccountInput (invalid email)', async () => {
      const input = new UpdateAccountInput();
      input.email = 'invalid-email';
      const errors = await validate(input);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toEqual('email');
    });
  });

  describe('LoginAccountInput', () => {
    it('should validate a valid LoginAccountInput object', async () => {
      const input = new LoginAccountInput();
      input.email = 'login@example.com';
      input.password = 'LoginPassword123';
      const errors = await validate(input);
      expect(errors.length).toBe(0);
    });

    it('should return errors for an invalid LoginAccountInput (missing email)', async () => {
      const input = new LoginAccountInput();
      input.password = 'LoginPassword123';
      const errors = await validate(input);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toEqual('email');
    });

    it('should return errors for an invalid LoginAccountInput (missing password)', async () => {
      const input = new LoginAccountInput();
      input.email = 'login@example.com';
      const errors = await validate(input);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toEqual('password');
    });

    it('should return errors for an invalid LoginAccountInput (invalid email format)', async () => {
      const input = new LoginAccountInput();
      input.email = 'invalid-email-format';
      input.password = 'LoginPassword123';
      const errors = await validate(input);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toEqual('email');
    });
  });
});