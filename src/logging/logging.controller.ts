import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import * as dayjs from 'dayjs';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

// Services
import { LoggingService } from './logging.service';

// Guards
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

// Entities
import { LoggingResource } from './entities/logging.entity';

const s3Client = new S3Client({
  region: 'eu-central-1',
});

@Controller('logging')
@UseGuards(JwtAuthGuard)
export class LoggingController {
  constructor(private readonly loggingService: LoggingService) {}

  @Get()
  async getAll(@Req() req) {
    if (!req.user.user.roles.find((role) => role.name === 'admin')) {
      throw new ForbiddenException();
    }

    return await this.loggingService.findAll({
      take: 100,
      order: {
        createdAt: 'DESC',
      },
      relations: {
        user: true,
        order: true,
        product: true,
      },
    });
  }

  @Get('/excel/:resource')
  async getExcel(@Req() req, @Param('resource') resource: LoggingResource) {
    if (!req.user.user.roles.find((role) => role.name === 'admin')) {
      throw new ForbiddenException();
    }

    if (!resource) {
      throw new BadRequestException();
    }

    if (resource === 'order') {
      const workbook = await this.loggingService.generateOrderLogs();
      const buffer = Buffer.from(await workbook.xlsx.writeBuffer());

      const params = {
        Bucket: 'taft-coffee-panel',
        Key: `logs/${resource}/${dayjs().format('DD-MMM-YYYY/HH:mm')}.xlsx`,
        Body: buffer,
        ContentType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };

      await s3Client.send(new PutObjectCommand(params));

      return {
        success: true,
        url: `https://taft-coffee-panel.s3.eu-central-1.amazonaws.com/${params.Key}`,
      };
    }
  }
}
