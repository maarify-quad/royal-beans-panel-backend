import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

// Utils
import { compare } from 'bcryptjs';
import { instanceToPlain } from 'class-transformer';

// Services
import { UserService } from 'src/user/user.service';

// Entities
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userService.findOneByUsername(username);
    const isValid = user ? await compare(pass, user.password) : false;
    if (isValid) {
      return user;
    }
    return null;
  }

  login(user: User) {
    const payload = instanceToPlain(user);
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
