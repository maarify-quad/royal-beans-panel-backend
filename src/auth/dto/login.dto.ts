import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'Kullanıcı adı boş bırakılamaz' })
  @IsString({ message: 'Kullanıcı adı metinsel bir değer olmalıdır' })
  username: string;

  @IsNotEmpty({ message: 'Şifre boş bırakılamaz' })
  @IsString({ message: 'Şifre metinsel bir değer olmalıdır' })
  password: string;
}
