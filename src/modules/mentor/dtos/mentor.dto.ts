import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';

export class CreateSkills {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  knowledgeAreaId: string;
}

export class CreateMultipleSkillsInput {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateSkills)
    skills: CreateSkills[];
}