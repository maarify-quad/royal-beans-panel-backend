import { Body, Controller, Get, Post } from '@nestjs/common';

// Services
import { TagService } from './tag.service';

// DTOs
import { CreateTagDto } from './dto/create-tag.dto';

@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get()
  async getTags() {
    const tags = await this.tagService.findAll();
    return { tags };
  }

  @Post()
  async createTag(@Body() dto: CreateTagDto) {
    const tag = await this.tagService.create(dto);
    return { tag };
  }
}
