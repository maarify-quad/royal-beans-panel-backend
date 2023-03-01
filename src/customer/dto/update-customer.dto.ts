import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString } from 'class-validator';

// DTOs
import { CreateCustomerDto } from './create-customer.dto';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {
  id: string;

  @IsString({ message: 'İsim metin olmalıdır' })
  @IsNotEmpty({ message: 'İsim boş bırakılamaz' })
  name: string;
}
