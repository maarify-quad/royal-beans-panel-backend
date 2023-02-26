import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';

// Services
import { TagService } from './tag.service';

// Guards
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

// DTOs
import { CreateTagDto } from './dto/create-tag.dto';

@Controller('tags')
@UseGuards(JwtAuthGuard)
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
