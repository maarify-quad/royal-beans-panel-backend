import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  companyTitle?: string;

  @MaxLength(255)
  @IsString()
  @IsOptional()
  contactName?: string;

  @MaxLength(255)
  @IsString()
  @IsOptional()
  contactTitle?: string;

  @MaxLength(255)
  @IsString()
  @IsOptional()
  secondContactName?: string;

  @MaxLength(255)
  @IsString()
  @IsOptional()
  secondContactTitle?: string;

  @IsEmail()
  @MaxLength(255)
  @IsString()
  @IsOptional()
  email?: string;

  @MaxLength(255)
  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @MaxLength(255)
  @IsString()
  @IsOptional()
  province?: string;

  @MaxLength(255)
  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  cargoAddress?: string;

  @MaxLength(255)
  @IsString()
  @IsOptional()
  cargoProvince?: string;

  @MaxLength(255)
  @IsString()
  @IsOptional()
  cargoCity?: string;

  @MaxLength(255)
  @IsString()
  @IsOptional()
  taxOffice?: string;

  @MaxLength(255)
  @IsString()
  @IsOptional()
  taxNo?: string;

  @IsNumber()
  @IsOptional()
  startBalance?: number;

  @IsNumber()
  @IsOptional()
  currentBalance?: number;

  @MaxLength(255)
  @IsString()
  @IsOptional()
  commercialPrinciple?: string;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsString()
  @IsOptional()
  specialNote?: string;
}
