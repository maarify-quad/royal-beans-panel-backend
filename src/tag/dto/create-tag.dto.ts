import { IsString, MaxLength } from 'class-validator';

export class CreateTagDto {
  @MaxLength(255)
  @IsString()
  name: string;
}
