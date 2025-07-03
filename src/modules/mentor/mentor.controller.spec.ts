import { Test, TestingModule } from '@nestjs/testing';
import { MentorController } from './mentor.controller';
import { MentorService } from './mentor.service';
import { LoggerService } from '../logger/logger.service';
import { HttpStatus, NotFoundException } from '@nestjs/common';
import { CreateSkills } from './dtos/mentor.dto';

describe('MentorController', () => {
  let controller: MentorController;
  let mentorService: MentorService;
  let loggerService: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MentorController],
      providers: [
        {
          provide: MentorService,
          useValue: {
            findAllSkill: jest.fn(),
            findMentorById: jest.fn(),
            findAllMentors: jest.fn(),
            findMentorsByKnowledgeArea: jest.fn(),
            addNewSkill: jest.fn(),
            findAllKnowledgeAreas: jest.fn(),
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

    controller = module.get<MentorController>(MentorController);
    mentorService = module.get<MentorService>(MentorService);
    loggerService = module.get<LoggerService>(LoggerService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAllSkills', () => {
    it('should return all skills', async () => {
      const mockSkills = [{ id: '1', name: 'Node.js' }];
      (mentorService.findAllSkill as jest.Mock).mockResolvedValue(mockSkills);

      const result = await controller.findAllSkills();

      expect(loggerService.info).toHaveBeenCalledWith({}, 'controller > mentor > findAllSkills');
      expect(mentorService.findAllSkill).toHaveBeenCalled();
      expect(result).toEqual(mockSkills);
    });

    it('should propagate errors from service', async () => {
      (mentorService.findAllSkill as jest.Mock).mockRejectedValue(new Error('Service error'));

      await expect(controller.findAllSkills()).rejects.toThrow('Service error');
      expect(loggerService.info).toHaveBeenCalledWith({}, 'controller > mentor > findAllSkills');
      expect(mentorService.findAllSkill).toHaveBeenCalled();
    });
  });

  describe('findMentorById', () => {
    it('should return a mentor by ID with OK status', async () => {
      const mentorId = 'some-id';
      const mockMentor = { id: mentorId, name: 'Test Mentor' };
      (mentorService.findMentorById as jest.Mock).mockResolvedValue(mockMentor);

      const result = await controller.findMentorById(mentorId);

      expect(loggerService.info).toHaveBeenCalledWith({}, 'controller > mentor > findMentorById');
      expect(mentorService.findMentorById).toHaveBeenCalledWith(mentorId);
      expect(result).toEqual({ status: HttpStatus.OK, content: mockMentor });
    });

    it('should propagate NotFoundException if mentor not found', async () => {
      const mentorId = 'non-existent-id';
      (mentorService.findMentorById as jest.Mock).mockRejectedValue(new NotFoundException('Mentor not found'));

      await expect(controller.findMentorById(mentorId)).rejects.toThrow(NotFoundException);
      await expect(controller.findMentorById(mentorId)).rejects.toThrow('Mentor not found');
      expect(loggerService.info).toHaveBeenCalledWith({}, 'controller > mentor > findMentorById');
      expect(mentorService.findMentorById).toHaveBeenCalledWith(mentorId);
    });

    it('should propagate other errors from service', async () => {
      const mentorId = 'error-id';
      (mentorService.findMentorById as jest.Mock).mockRejectedValue(new Error('Service error'));

      await expect(controller.findMentorById(mentorId)).rejects.toThrow('Service error');
      expect(loggerService.info).toHaveBeenCalledWith({}, 'controller > mentor > findMentorById');
      expect(mentorService.findMentorById).toHaveBeenCalledWith(mentorId);
    });
  });

  describe('findAllMentors', () => {
    it('should return all mentors', async () => {
      const mockMentors = [{ id: 'm1', name: 'Mentor One' }];
      (mentorService.findAllMentors as jest.Mock).mockResolvedValue(mockMentors);

      const result = await controller.findAllMentors();

      expect(loggerService.info).toHaveBeenCalledWith({}, 'controller > mentor > findAllMentors');
      expect(mentorService.findAllMentors).toHaveBeenCalled();
      expect(result).toEqual(mockMentors);
    });

    it('should propagate errors from service', async () => {
      (mentorService.findAllMentors as jest.Mock).mockRejectedValue(new Error('Service error'));

      await expect(controller.findAllMentors()).rejects.toThrow('Service error');
      expect(loggerService.info).toHaveBeenCalledWith({}, 'controller > mentor > findAllMentors');
      expect(mentorService.findAllMentors).toHaveBeenCalled();
    });
  });

  describe('findMentorByKnowledgeArea', () => {
    it('should return mentors by knowledge area', async () => {
      const knowledgeAreaId = 'area-id';
      const mockMentors = [{ id: 'm1', name: 'Mentor One', skills: [{ knowledgeAreaId }] }];
      (mentorService.findMentorsByKnowledgeArea as jest.Mock).mockResolvedValue(mockMentors);

      const result = await controller.findMentorByKnowledgeArea(knowledgeAreaId);

      expect(loggerService.info).toHaveBeenCalledWith({}, 'controller > accounts > findMentorByKnowledgeArea');
      expect(mentorService.findMentorsByKnowledgeArea).toHaveBeenCalledWith(knowledgeAreaId);
      expect(result).toEqual(mockMentors);
    });

    it('should propagate NotFoundException if no mentors found', async () => {
      const knowledgeAreaId = 'non-existent-area';
      (mentorService.findMentorsByKnowledgeArea as jest.Mock).mockRejectedValue(new NotFoundException('Mentors not found'));

      await expect(controller.findMentorByKnowledgeArea(knowledgeAreaId)).rejects.toThrow(NotFoundException);
      await expect(controller.findMentorByKnowledgeArea(knowledgeAreaId)).rejects.toThrow('Mentors not found');
      expect(loggerService.info).toHaveBeenCalledWith({}, 'controller > accounts > findMentorByKnowledgeArea');
      expect(mentorService.findMentorsByKnowledgeArea).toHaveBeenCalledWith(knowledgeAreaId);
    });

    it('should propagate other errors from service', async () => {
      const knowledgeAreaId = 'error-area';
      (mentorService.findMentorsByKnowledgeArea as jest.Mock).mockRejectedValue(new Error('Service error'));

      await expect(controller.findMentorByKnowledgeArea(knowledgeAreaId)).rejects.toThrow('Service error');
      expect(loggerService.info).toHaveBeenCalledWith({}, 'controller > accounts > findMentorByKnowledgeArea');
      expect(mentorService.findMentorsByKnowledgeArea).toHaveBeenCalledWith(knowledgeAreaId);
    });
  });

  describe('addNewSkill', () => {
    it('should add new skills and return CREATED status', async () => {
      const mentorId = 'mentor-with-skills';
      const createSkills: CreateSkills = { name: 'New Skill', knowledgeAreaId: 'new-area-id' };
      (mentorService.addNewSkill as jest.Mock).mockResolvedValue(undefined);

      const result = await controller.addNewSkill(mentorId, createSkills);

      expect(loggerService.info).toHaveBeenCalledWith({}, 'controller > accounts > deleteSkills');
      expect(mentorService.addNewSkill).toHaveBeenCalledWith(mentorId, createSkills);
      expect(result).toEqual({ status: HttpStatus.CREATED, content: undefined });
    });

    it('should propagate errors from service', async () => {
      const mentorId = 'error-mentor';
      const createSkills: CreateSkills = { name: 'Skill to fail', knowledgeAreaId: 'fail-area' };
      (mentorService.addNewSkill as jest.Mock).mockRejectedValue(new Error('Service error adding skill'));

      await expect(controller.addNewSkill(mentorId, createSkills)).rejects.toThrow('Service error adding skill');
      expect(loggerService.info).toHaveBeenCalledWith({}, 'controller > accounts > deleteSkills');
      expect(mentorService.addNewSkill).toHaveBeenCalledWith(mentorId, createSkills);
    });
  });

  describe('findAllKnowledgeAreas', () => {
    it('should return all knowledge areas', async () => {
      const mockKnowledgeAreas = [{ id: 'ka1', name: 'Web Development' }];
      (mentorService.findAllKnowledgeAreas as jest.Mock).mockResolvedValue(mockKnowledgeAreas);

      const result = await controller.findAllKnowledgeAreas();

      expect(mentorService.findAllKnowledgeAreas).toHaveBeenCalled();
      expect(result).toEqual(mockKnowledgeAreas);
    });

    it('should propagate errors from service', async () => {
      (mentorService.findAllKnowledgeAreas as jest.Mock).mockRejectedValue(new Error('Service error'));

      await expect(controller.findAllKnowledgeAreas()).rejects.toThrow('Service error');
      expect(mentorService.findAllKnowledgeAreas).toHaveBeenCalled();
    });
  });
});