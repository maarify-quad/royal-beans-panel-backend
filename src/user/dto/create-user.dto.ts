import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

export class CreateUserDto {
  @MaxLength(255, { message: 'Ad 255 karakterden az olmalıdır' })
  @IsNotEmpty({ message: 'Ad boş bırakılamaz' })
  @IsString({ message: 'AD metinsel bir değer olmalıdır' })
  firstName: string;

  @MaxLength(255, { message: 'Soyad 255 karakterden az olmalıdır' })
  @IsNotEmpty({ message: 'Soyad boş bırakılamaz' })
  @IsString({ message: 'Soyad metinsel bir değer olmalıdır' })
  lastName: string;

  @MaxLength(255, { message: 'Kullanıcı adı 255 karakterden az olmalıdır' })
  @IsNotEmpty({ message: 'Kullanıcı adı boş bırakılamaz' })
  @IsString({ message: 'Kullanıcı aıd metinsel bir değer olmalıdır' })
  username: string;

  @MaxLength(255, { message: 'E-posta 255 karakterden az olmalıdır' })
  @IsEmail({ message: 'Geçersiz e-posta adresi' })
  @IsNotEmpty({ message: 'E-posta boş bırakılamaz' })
  @IsString({ message: 'E-posta metinsel bir değer olmalıdır' })
  email: string;

  @Length(8, 20, { message: 'Şifre 8 ile 20 karakter arasında olmalıdır' })
  @IsNotEmpty({ message: 'Şifre boş bırakılamaz' })
  @IsString({ message: 'Şifre metinsel bir değer olmalıdır' })
  password: string;
}
