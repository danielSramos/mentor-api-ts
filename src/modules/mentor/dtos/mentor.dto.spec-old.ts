import { validate } from 'class-validator';
import { CreateSkills } from './mentor.dto';

describe('Mentor DTOs', () => {

  describe('CreateSkills', () => {
    it('should validate a valid CreateSkills object', async () => {
      const input = new CreateSkills();
      input.name = 'JavaScript';
      input.knowledgeAreaId = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';
      const errors = await validate(input);
      expect(errors.length).toBe(0);
    });

    it('should return errors for a CreateSkills object with missing name', async () => {
      const input = new CreateSkills();
      input.knowledgeAreaId = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';
      const errors = await validate(input);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toEqual('name');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should return errors for a CreateSkills object with missing knowledgeAreaId', async () => {
      const input = new CreateSkills();
      input.name = 'Python';
      const errors = await validate(input);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toEqual('knowledgeAreaId');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should return errors for a CreateSkills object with empty strings', async () => {
      const input = new CreateSkills();
      input.name = '';
      input.knowledgeAreaId = '';
      const errors = await validate(input);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(err => err.property === 'name' && err.constraints?.isNotEmpty)).toBeTruthy();
      expect(errors.some(err => err.property === 'knowledgeAreaId' && err.constraints?.isNotEmpty)).toBeTruthy();
    });
  });
});