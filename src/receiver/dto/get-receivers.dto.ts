import { IsNumberString, IsOptional } from 'class-validator';

export class GetReceiversDTO {
  @IsNumberString()
  @IsOptional()
  readonly page?: string;

  @IsNumberString()
  @IsOptional()
  readonly limit?: string;
}
