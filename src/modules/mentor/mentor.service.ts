import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { LoggerService } from '../logger/logger.service';
import { randomUUID } from 'crypto';

@Injectable()
export class MentorService {
  constructor(
    private readonly logger: LoggerService,
    private readonly db: DatabaseService,
  ) {}

  async findAllMentors() {
    try {
      this.logger.info({}, 'services > mentor > findAllMentors > params');

      const allMentors = await this.db.users.findMany({
        where: {
          user_profiles: {
            profiles: {
              id: '2e8825ad-7f43-415b-acad-580a8314fd00',
            },
          },
        },
        include: {
          user_profiles: {
            include: {
              profiles: true,
            },
          },
        },
      });

      return allMentors;
    } catch (error) {
      this.logger.error(
        error,
        'services > mentor > findAllMentors > exception',
      );
      throw error;
    }
  }

  async findMentorById(mentorId: string) {
    try {
      this.logger.info({}, 'services > mentor > findMentorById > params');

      const mentorProfile = await this.db.userProfiles.findUnique({
        where: {
          fk_user_id: mentorId,
        },
      });

      const mentor = await this.db.users.findUnique({
        where: {
          id: mentorId,
          user_profiles: mentorProfile,
        },
      });

      if (!mentor) {
        throw new NotFoundException('Mentor not found');
      }

      return mentor;
    } catch (error) {
      this.logger.error(
        error,
        'services > mentor > findMentorByID > exception',
      );
      throw error;
    }
  }

  async findMentorsByKnowledgeArea(knowledgeAreaId: string) {
    try {
      this.logger.info({}, 'services > mentor > findMentorById > params');
      const mentorsByKnowledgeArea = await this.db.users.findMany({
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

      if (!mentorsByKnowledgeArea) {
        throw new NotFoundException('Mentors not found');
      }
      return mentorsByKnowledgeArea;
    } catch (error) {
      this.logger.error(
        error,
        'services > accounts > findMentorByKnowledgeArea > exception',
      );
      throw error;
    }
  }

  async findAllKnowledgeAreas() {
    try {
      this.logger.info(
        {},
        'services > mentor > findAllKnowledgeAreas > params',
      );

      const knowledgeAreas = await this.db.knowledgeAreas.findMany();

      // if (!knowledgeAreas) {
      //   throw new NotFoundException('knowledge areas not found');
      // }

      return knowledgeAreas;
    } catch (error) {
      this.logger.error(
        error,
        'services > accounts > findAllKnowledgeAreas > exception',
      );
      throw error;
    }
  }

  async findAllSkill() {
    try {
      this.logger.info({}, 'services > mentor > findAllSkills > params');

      const skills = await this.db.skills.findMany();

      return skills;
    } catch (error) {
      this.logger.error(
        error,
        'services > accounts > findAllSkills > exception',
      );
      throw error;
    }
  }

  async addNewSkill(userId: string, skills: any) {
    try {
      this.logger.info({ userId }, 'services > mentor > addNewSkills > params');

      await this.db.skills.deleteMany({
        where: {
          fk_user_id: userId,
        },
      });

      const skillWithUserId = skills.map((skill: any) => ({
        ...skill,
        id: randomUUID(),
        fk_user_id: userId,
      }));

      await this.db.skills.createMany({
        data: skillWithUserId,
      });
    } catch (error) {
      this.logger.error(error, 'services > mentor > addNewSkills > exception');
      throw error;
    }
  }

  //refatorar metodos para remover a classe repository - OK
  //listar todos os mentores - OK
  //listar mentor por habilidade -
  //listar mentor por área de conhecimendo
  //cadastro de mentor
  //atualizar mentor
  //atualizar skills do mentor
}
