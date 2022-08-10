import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateSupplierDto {
  @IsNotEmpty({ message: 'Ad boş bırakılamaz' })
  @IsString({ message: 'Ad metinsel bir değer olmalıdır' })
  name: string;

  @IsString({ message: 'Adres metinsel bir değer olmalıdır' })
  @IsOptional()
  address?: string;

  @MaxLength(255, { message: 'Vergi no 255 karakterden az olmalıdır' })
  @IsString({ message: 'Vergi no metinsel bir değer olmalıdır' })
  @IsOptional()
  taxNo?: string;

  @MaxLength(255, { message: 'Vergi dairesi 255 karakterden az olmalıdır' })
  @IsString({ message: 'Vergi dairesi metinsel bir değer olmalıdır' })
  @IsOptional()
  taxOffice?: string;

  @MaxLength(255, { message: 'Muhatap adı 255 karakterden az olmalıdır' })
  @IsNotEmpty({ message: 'Muhatap adı boş bırakılamaz' })
  @IsString({ message: 'Muhatap adı metinsel bir değer olmalıdır' })
  @IsOptional()
  contactName?: string;

  @MaxLength(255, { message: 'Muhatap mevkii 255 karakterden az olmalıdır' })
  @IsNotEmpty({ message: 'Muhatap mevkii boş bırakılamaz' })
  @IsString({ message: 'Muhatap mevkii metinsel bir değer olmalıdır' })
  @IsOptional()
  contactPosition?: string;

  @MaxLength(255, { message: 'Muhatap telefonu 255 karakterden az olmalıdır' })
  @IsNotEmpty({ message: 'Muhatap telefonu boş bırakılamaz' })
  @IsString({ message: 'Muhatap telefonu metinsel bir değer olmalıdır' })
  @IsOptional()
  contactPhone?: string;

  @IsEmail({ message: 'Muhatap e-posta adresi geçersiz' })
  @MaxLength(255, { message: 'Muhatap e-postası 255 karakterden az olmalıdır' })
  @IsNotEmpty({ message: 'Muhatap e-postası boş bırakılamaz' })
  @IsString({ message: 'Muhatap e-postası metinsel bir değer olmalıdır' })
  @IsOptional()
  contactEmail?: string;
}
