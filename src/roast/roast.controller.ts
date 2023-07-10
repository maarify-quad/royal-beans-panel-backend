import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Between } from 'typeorm';
import * as ExcelJS from 'exceljs';
import * as dayjs from 'dayjs';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

// Services
import { RoastService } from './roast.service';
import { LoggingService } from 'src/logging/logging.service';

// Guards
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

// DTOs
import { CreateRoastDto } from './dto/create-roast.dto';
import { GetRoastsDto } from './dto/get-roasts.dto';
import { ExcelExportRoastsDTO } from './dto/excel-export-roasts.dto';

const s3Client = new S3Client({
  region: 'eu-central-1',
});

@Controller('roasts')
@UseGuards(JwtAuthGuard)
export class RoastController {
  constructor(
    private readonly roastService: RoastService,
    private readonly loggingService: LoggingService,
  ) {}

  @Get()
  async getRoasts(@Query() query: GetRoastsDto) {
    // If no query is provided, return all roasts
    if (!query.limit || !query.page) {
      const roasts = await this.roastService.findAll();
      return { roasts, totalPages: 1, totalCount: roasts.length };
    }

    // Parse query params
    const limit = parseInt(query.limit || '25', 10);
    const page = parseInt(query.page || '1', 10);

    // If query is provided, return roasts matching query
    const result = await this.roastService.findAndCount({
      take: limit,
      skip: limit * (page - 1),
      order: {
        id: 'DESC',
      },
    });

    // Return roasts and total count
    const roasts = result[0];
    const totalCount = result[1];
    const totalPages = Math.ceil(totalCount / limit);

    // End response
    return { roasts, totalPages, totalCount };
  }

  @Get(':id')
  async getRoastById(@Param('id') id: string) {
    const roast = await this.roastService.findById(id);
    return { roast };
  }

  @Post()
  async createRoast(@Req() req, @Body() createRoastDto: CreateRoastDto) {
    const roast = await this.roastService.createRoast(createRoastDto);

    try {
      await this.loggingService.create({
        userId: req.user.user.id,
        message: `${roast.id} kodlu kavrum oluşturuldu.`,
        resource: 'roast',
        operation: 'create',
      });
    } catch {}

    return roast;
  }

  @Post('/excel-export')
  async exportRoastsExcel(@Body() dto: ExcelExportRoastsDTO) {
    const { startDate, endDate } = dto;

    console.log({
      startDate,
      endDate,
    });

    const roasts = await this.roastService.findAll({
      where: {
        ...(startDate &&
          endDate && {
            createdAt: Between(new Date(startDate), new Date(endDate)),
          }),
      },
      relations: {
        roastDetails: { product: true },
      },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Kavrumlar');

    worksheet.columns = [
      { header: 'Kavrum Kodu', key: 'id', width: 15 },
      { header: 'Posta', key: 'roundId', width: 15 },
      { header: 'Kahve', key: 'productName', width: 15 },
      { header: 'Atılan', key: 'inputAmount', width: 15 },
      { header: 'Alınan', key: 'outputAmount', width: 15 },
      { header: 'Fire', key: 'differenceAmount', width: 15 },
      { header: 'Tarih', key: 'createdAt', width: 15 },
    ];

    roasts.forEach((roast) => {
      roast.roastDetails.forEach((roastDetail) => {
        worksheet.addRow({
          id: roast.id,
          roundId: roastDetail.roundId,
          productName: roastDetail.product.name,
          inputAmount: roastDetail.inputAmount,
          outputAmount: roastDetail.outputAmount,
          differenceAmount: roastDetail.differenceAmount,
          createdAt: dayjs(roast.createdAt).format('DD MMMM YYYY'),
        });
      });
    });

    worksheet.getRow(1).font = { bold: true };

    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
    const params = {
      Bucket: 'taft-coffee-panel',
      Key: `excel/roasts/${dayjs().format('DD-MMM-YYYY HH:mm')}.xlsx`,
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
