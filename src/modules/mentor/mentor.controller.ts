import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import { MentorService } from './mentor.service';
import { AuthService } from '../auth/auth.service';
import { CreateSkills } from './dtos/mentor.dto';

@Controller('mentors')
export class MentorController {
  constructor(
    private readonly logger: LoggerService,
    private readonly service: MentorService,
  ) {}

  @Get('/skills')
  findAllSkills() {
    this.logger.info({}, 'controller > mentor > findAllSkills');
    return this.service.findAllSkill();
  }

  @Get('/:mentorId')
  async findMentorById(@Param('mentorId') mentorId: string) {
    this.logger.info({}, 'controller > mentor > findMentorById');

    const mentor = await this.service.findMentorById(mentorId);

    return { status: HttpStatus.OK, content: mentor };
  }

  @Get()
  async findAllMentors() {
    this.logger.info({}, 'controller > mentor > findAllMentors');
    return await this.service.findAllMentors();
  }

  @Get('/:knowledgeAreaId/knowledgeAreas')
  async findMentorByKnowledgeArea(
    @Param('knowledgeAreaId') knowledgeAreaId: string,
  ) {
    this.logger.info({}, 'controller > accounts > findMentorByKnowledgeArea');

    const mentors = this.service.findMentorsByKnowledgeArea(knowledgeAreaId);

    return mentors;
  }

  @Post('/:mentorId/createSkills')
  async addNewSkill(
    @Param('mentorId') mentorId: string,
    @Body() createSkills: CreateSkills,
  ) {
    this.logger.info({}, 'controller > accounts > deleteSkills');

    const newSkills = await this.service.addNewSkill(mentorId, createSkills);
    return { status: HttpStatus.CREATED, content: newSkills };
  }

  @Get('/knowledgeAreas/list')
  findAllKnowledgeAreas() {
    return this.service.findAllKnowledgeAreas();
  }
}
