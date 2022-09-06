import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';

// Entities
import { RoastDetail } from 'src/roast-detail/entities/roast-detail.entity';

// DTOs
import { CreateRoastDetailDto } from 'src/roast-detail/dto/create-roast-detail.dto';

export class CreateRoastDto {
  @ValidateNested({ each: true })
  @ArrayMinSize(1, { message: 'Kavrum için en az 1 ürün gereklidir' })
  @IsArray({ message: 'Kavrum ürünleri sizi türünde olmalıdır' })
  @Type(() => CreateRoastDetailDto)
  roastDetails: RoastDetail[];
}
