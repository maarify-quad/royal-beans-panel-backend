import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateReceiverDTO {
  @MaxLength(255)
  @IsString()
  name: string;

  @MaxLength(255)
  @IsString()
  @IsOptional()
  neighborhood?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @MaxLength(255)
  @IsString()
  @IsOptional()
  city?: string;

  @MaxLength(255)
  @IsString()
  @IsOptional()
  province?: string;

  @MaxLength(255)
  @IsString()
  @IsOptional()
  phone?: string;
}
