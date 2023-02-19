import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Entities
import { Tag } from './entities/tag.entity';

// DTOs
import { CreateTagDto } from './dto/create-tag.dto';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag) private readonly tagRepo: Repository<Tag>,
  ) {}

  async findAll() {
    return await this.tagRepo.find();
  }

  async create(dto: CreateTagDto) {
    const tag = this.tagRepo.create(dto);
    return await this.tagRepo.save(tag);
  }
}
