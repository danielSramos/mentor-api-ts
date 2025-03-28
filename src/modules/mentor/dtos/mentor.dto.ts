import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSkills {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  knowledgeAreaId: string;
}
