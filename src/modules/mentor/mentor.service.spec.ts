import { Test, TestingModule } from '@nestjs/testing';
import { MentorService } from './mentor.service';
import { LoggerService } from '../logger/logger.service';
import { DatabaseService } from '../database/database.service';
import { NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';

jest.mock('crypto', () => {
  const actual = jest.requireActual('crypto'); // Carrega o módulo 'crypto' real
  return {
    ...actual, // Exporta todas as funções reais de 'crypto'
    randomUUID: jest.fn(() => 'mock-uuid'), // Apenas substitui randomUUID
  };
});
describe('MentorService', () => {
  let service: MentorService;
  let loggerService: LoggerService;
  let databaseService: DatabaseService;

  const mockDbUsers = {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  };

  const mockDbUserProfiles = {
    findUnique: jest.fn(),
  };

  const mockDbKnowledgeAreas = {
    findMany: jest.fn(),
  };

  const mockDbSkills = {
    findMany: jest.fn(),
    deleteMany: jest.fn(),
    createMany: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MentorService,
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
            users: mockDbUsers,
            userProfiles: mockDbUserProfiles,
            knowledgeAreas: mockDbKnowledgeAreas,
            skills: mockDbSkills,
          },
        },
      ],
    }).compile();

    service = module.get<MentorService>(MentorService);
    loggerService = module.get<LoggerService>(LoggerService);
    databaseService = module.get<DatabaseService>(DatabaseService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllMentors', () => {
    it('should return all mentors', async () => {
      const mockMentors = [
        { id: 'mentor1', name: 'Mentor One', user_profiles: { profiles: { id: '2e8825ad-7f43-415b-acad-580a8314fd00' } } },
        { id: 'mentor2', name: 'Mentor Two', user_profiles: { profiles: { id: '2e8825ad-7f43-415b-acad-580a8314fd00' } } },
      ];
      mockDbUsers.findMany.mockResolvedValue(mockMentors);

      const result = await service.findAllMentors();

      expect(loggerService.info).toHaveBeenCalledWith({}, 'services > mentor > findAllMentors > params');
      expect(mockDbUsers.findMany).toHaveBeenCalledWith({
        where: {
          user_profiles: {
            profiles: {
              id: '2e8825ad-7f43-415b-acad-580a8314fd00',
            },
          },
        },
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
          user_profiles: {
            select: {
              id: true,
              fk_profile_id: true,
              profiles: {
                select: {
                  id: true,
                  profile_name: true,
                },
              },
            },
          },
          skills: {
            select: {
              id: true,
              name: true,
              fk_knowledge_area_id: true,
              knowledgeAreas: { select: { id: true, name: true } }
            }
          }
        },
      });
      expect(result).toEqual(mockMentors);
    });

    it('should throw an error if database call fails', async () => {
      const error = new Error('DB error');
      mockDbUsers.findMany.mockRejectedValue(error);

      await expect(service.findAllMentors()).rejects.toThrow(error);
      expect(loggerService.error).toHaveBeenCalledWith(error, 'services > mentor > findAllMentors > exception');
    });
  });

  describe('findMentorById', () => {
    const mentorId = 'some-mentor-id';
    const mockUserProfile = { fk_user_id: mentorId, profile_id: 'some-profile-id' };
    const mockMentor = { id: mentorId, name: 'Test Mentor' };

    it('should return a mentor by ID', async () => {
      mockDbUserProfiles.findUnique.mockResolvedValue(mockUserProfile);
      mockDbUsers.findUnique.mockResolvedValue(mockMentor);

      const result = await service.findMentorById(mentorId);

      expect(loggerService.info).toHaveBeenCalledWith({}, 'services > mentor > findMentorById > params');
      //expect(mockDbUserProfiles.findUnique).toHaveBeenCalledWith({ where: { fk_user_id: mentorId } });
      expect(mockDbUsers.findUnique).toHaveBeenCalledWith({
        where: {
          id: mentorId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          user_profiles: {
            select: {
              id: true,
              fk_profile_id: true,
              profiles: {
                select: {
                  id: true,
                  profile_name: true,
                },
              },
            },
          },
          skills: {
            select: {
              id: true,
              name: true,
              fk_knowledge_area_id: true,
              knowledgeAreas: { select: { id: true, name: true } }
            }
          }
        },
      });
      expect(result).toEqual(mockMentor);
    });

    it('should throw NotFoundException if mentor not found', async () => {
      mockDbUserProfiles.findUnique.mockResolvedValue(mockUserProfile); // Profile found
      mockDbUsers.findUnique.mockResolvedValue(undefined); // Mentor not found

      await expect(service.findMentorById(mentorId)).rejects.toThrow(NotFoundException);
      await expect(service.findMentorById(mentorId)).rejects.toThrow('Mentor not found');
      expect(loggerService.error).toHaveBeenCalledWith(expect.any(NotFoundException), 'services > mentor > findMentorByID > exception');
    });

    it('should throw an error if database call fails during userProfile search', async () => {
      const error = new Error('DB userProfile error');
      mockDbUserProfiles.findUnique.mockRejectedValue(error);

      await expect(service.findMentorById(mentorId)).rejects.toThrow(error);
      expect(loggerService.error).toHaveBeenCalledWith(error, 'services > mentor > findMentorByID > exception');
    });

    it('should throw an error if database call fails during user search', async () => {
      const error = new Error('DB user error');
      mockDbUserProfiles.findUnique.mockResolvedValue(mockUserProfile);
      mockDbUsers.findUnique.mockRejectedValue(error);

      await expect(service.findMentorById(mentorId)).rejects.toThrow(error);
      expect(loggerService.error).toHaveBeenCalledWith(error, 'services > mentor > findMentorByID > exception');
    });
  });

  describe('findMentorsByKnowledgeArea', () => {
    const knowledgeAreaId = 'some-knowledge-area-id';
    const mockMentors = [{ id: 'mentor1', name: 'Mentor A', skills: [{ fk_knowledge_area_id: knowledgeAreaId }] }];

    it('should return mentors by knowledge area', async () => {
      mockDbUsers.findMany.mockResolvedValue(mockMentors);

      const result = await service.findMentorsByKnowledgeArea(knowledgeAreaId);

      expect(loggerService.info).toHaveBeenCalledWith({}, 'services > mentor > findMentorById > params'); // Logger message seems incorrect in source, using existing one.
      expect(mockDbUsers.findMany).toHaveBeenCalledWith({
        where: {
          skills: {
            some: {
              fk_knowledge_area_id: knowledgeAreaId,
            },
          },
        },
        include: {
          skills: {
            include: {
              knowledgeAreas: true,
            },
          },
        },
      });
      expect(result).toEqual(mockMentors);
    });

    it('should throw NotFoundException if no mentors found for the knowledge area', async () => {
      mockDbUsers.findMany.mockResolvedValue(null); // Or an empty array, depending on Prisma's actual return for no results

      // Note: A `findMany` returning `null` is unlikely, it usually returns `[]`.
      // The current service code throws NotFound if `!mentorsByKnowledgeArea`.
      // If Prisma returns `[]` (empty array) for no results, the `if (!mentorsByKnowledgeArea)` check will not throw.
      // Adjusting mock to simulate `null` as per service logic.
      await expect(service.findMentorsByKnowledgeArea(knowledgeAreaId)).rejects.toThrow(NotFoundException);
      await expect(service.findMentorsByKnowledgeArea(knowledgeAreaId)).rejects.toThrow('Mentors not found');
      expect(loggerService.error).toHaveBeenCalledWith(expect.any(NotFoundException), 'services > accounts > findMentorByKnowledgeArea > exception'); // Logger message seems incorrect in source, using existing one.
    });

    it('should throw an error if database call fails', async () => {
      const error = new Error('DB error');
      mockDbUsers.findMany.mockRejectedValue(error);

      await expect(service.findMentorsByKnowledgeArea(knowledgeAreaId)).rejects.toThrow(error);
      expect(loggerService.error).toHaveBeenCalledWith(error, 'services > accounts > findMentorByKnowledgeArea > exception');
    });
  });

  describe('findAllKnowledgeAreas', () => {
    it('should return all knowledge areas', async () => {
      const mockAreas = [{ id: 'area1', name: 'Programming' }];
      mockDbKnowledgeAreas.findMany.mockResolvedValue(mockAreas);

      const result = await service.findAllKnowledgeAreas();

      expect(loggerService.info).toHaveBeenCalledWith({}, 'services > mentor > findAllKnowledgeAreas > params');
      expect(mockDbKnowledgeAreas.findMany).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockAreas);
    });

    it('should throw an error if database call fails', async () => {
      const error = new Error('DB error');
      mockDbKnowledgeAreas.findMany.mockRejectedValue(error);

      await expect(service.findAllKnowledgeAreas()).rejects.toThrow(error);
      expect(loggerService.error).toHaveBeenCalledWith(error, 'services > accounts > findAllKnowledgeAreas > exception');
    });
  });

  describe('findAllSkill', () => {
    it('should return all skills', async () => {
      const mockSkills = [{ id: 'skill1', name: 'Node.js' }];
      mockDbSkills.findMany.mockResolvedValue(mockSkills);

      const result = await service.findAllSkill();

      expect(loggerService.info).toHaveBeenCalledWith({}, 'services > mentor > findAllSkills > params');
      expect(mockDbSkills.findMany).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockSkills);
    });

    it('should throw an error if database call fails', async () => {
      const error = new Error('DB error');
      mockDbSkills.findMany.mockRejectedValue(error);

      await expect(service.findAllSkill()).rejects.toThrow(error);
      expect(loggerService.error).toHaveBeenCalledWith(error, 'services > accounts > findAllSkills > exception');
    });
  });

  describe('addNewSkill', () => {
    const userId = 'user-with-skills';
    const skillsInput = { name: 'New Skill 1', knowledgeAreaId: 'area1' };

    it('should delete existing skills and add new ones', async () => {
      mockDbSkills.deleteMany.mockResolvedValue({ count: 5 });
      mockDbSkills.create.mockResolvedValue({ count: skillsInput });

      await service.addNewSkill(userId, skillsInput);

      expect(loggerService.info).toHaveBeenCalledWith({ userId }, 'services > mentor > addNewSkills > params');
      expect(mockDbSkills.deleteMany).toHaveBeenCalledWith({
        where: {
          fk_user_id: userId,
        },
      });
      expect(mockDbSkills.create).toHaveBeenCalledWith({
        data: {
          id: 'mock-uuid',
          fk_user_id: userId,
          fk_knowledge_area_id: 'area1',
          name: 'New Skill 1',
        },
      });
    });

    it('should throw an error if database delete fails', async () => {
      const error = new Error('DB delete error');
      mockDbSkills.deleteMany.mockRejectedValue(error);

      await expect(service.addNewSkill(userId, skillsInput)).rejects.toThrow(error);
      expect(loggerService.error).toHaveBeenCalledWith(error, 'services > mentor > addNewSkills > exception');
    });

    it('should throw an error if database create fails', async () => {
      const error = new Error('DB create error');
      mockDbSkills.deleteMany.mockResolvedValue({ count: 0 });
      mockDbSkills.create.mockRejectedValue(error);

      await expect(service.addNewSkill(userId, skillsInput)).rejects.toThrow(error);
      expect(loggerService.error).toHaveBeenCalledWith(error, 'services > mentor > addNewSkills > exception');
    });
  });
});