import { IsOptional, IsString } from 'class-validator';

export class UpdateSupplierDto {
  @IsString()
  @IsOptional()
  readonly address?: string;

  @IsString()
  @IsOptional()
  readonly taxNo?: string;

  @IsString()
  @IsOptional()
  readonly taxOffice?: string;

  @IsString()
  @IsOptional()
  readonly contactName?: string;

  @IsString()
  @IsOptional()
  readonly contactPosition?: string;

  @IsString()
  @IsOptional()
  readonly contactPhone?: string;

  @IsString()
  @IsOptional()
  readonly contactEmail?: string;
}
