import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';

// Entities
import { Deci } from './entities/deci.entity';

// DTOs
import { CreateDeciDTO } from './dto/create-deci.dto';
import { UpdateDeciDTO } from './dto/update-deci.dto';

@Injectable()
export class DeciService {
  constructor(
    @InjectRepository(Deci) private readonly deciRepo: Repository<Deci>,
  ) {}

  findAll(options?: FindManyOptions<Deci>) {
    return this.deciRepo.find(options);
  }

  findOne(options?: FindOneOptions<Deci>) {
    return this.deciRepo.findOne(options);
  }

  create(dto: CreateDeciDTO) {
    const newDeci = this.deciRepo.create(dto);
    return this.deciRepo.save(newDeci);
  }

  update(id: number, dto: UpdateDeciDTO) {
    return this.deciRepo.update(id, dto);
  }
}
