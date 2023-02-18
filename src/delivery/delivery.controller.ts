import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

// Services
import { DeliveryService } from './delivery.service';
import { SupplierService } from 'src/supplier/supplier.service';
import { ProductService } from 'src/product/product.service';

// Guards
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

// DTOs
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { GetDeliveriesDto } from './dto/get-deliveries.dto';

@Controller('deliveries')
@UseGuards(JwtAuthGuard)
export class DeliveryController {
  constructor(
    private readonly deliveryService: DeliveryService,
    private readonly supplierService: SupplierService,
    private readonly productService: ProductService,
  ) {}

  @Get()
  async findAll(@Query() query: GetDeliveriesDto) {
    // If no query is provided, return all deliveries
    if (!query.limit || !query.page) {
      const deliveries = await this.deliveryService.findAll({
        relations: { supplier: true },
        order: { id: 'DESC' },
        withDeleted: query.withDeleted === 'true',
      });
      return { deliveries, totalPages: 1, totalCount: deliveries.length };
    }

    // Parse query params
    const limit = parseInt(query.limit || '25', 10);
    const page = parseInt(query.page || '1', 10);

    // If query is provided, return deliveries matching query
    const result = await this.deliveryService.findAndCount({
      relations: { supplier: true },
      take: limit,
      skip: limit * (page - 1),
      order: { id: 'DESC' },
      withDeleted: query.withDeleted === 'true',
    });

    // Return deliveries and total count
    const deliveries = result[0];
    const totalCount = result[1];
    const totalPages = Math.ceil(totalCount / limit);

    // End response
    return { deliveries, totalPages, totalCount };
  }

  @Get(':id')
  findOneById(@Param('id') id: string) {
    return this.deliveryService.findOneById(id, { withDeleted: true });
  }

  @Get('/product/:stockCode')
  async getProductDeliveryDetails(
    @Query() query: GetDeliveriesDto,
    @Param('stockCode') stockCode: string,
  ) {
    const limit = parseInt(query.limit || '25', 10);
    const page = parseInt(query.page || '1', 10);

    const result = await this.deliveryService.findAndCount({
      where: { deliveryDetails: { product: { stockCode } } },
      take: limit,
      skip: (page - 1) * limit,
      relations: {
        deliveryDetails: { product: true, delivery: { supplier: true } },
      },
      withDeleted: true,
    });

    const deliveryDetails = result[0]
      .map((delivery) => {
        const deliveryDetails = delivery.deliveryDetails.filter(
          (deliveryDetail) => deliveryDetail.product.stockCode === stockCode,
        );

        return deliveryDetails;
      })
      .flat();
    const totalCount = result[1];
    const totalPages = Math.ceil(totalCount / limit);

    return { deliveryDetails, totalPages, totalCount };
  }

  @Get('/supplier/:id')
  async getSupplierDeliveries(
    @Query() query: GetDeliveriesDto,
    @Param('id') id: string,
  ) {
    const limit = parseInt(query.limit || '25', 10);
    const page = parseInt(query.page || '1', 10);

    const result = await this.deliveryService.findAndCount({
      where: { supplierId: id },
      take: limit,
      skip: (page - 1) * limit,
      withDeleted: query.withDeleted === 'true',
    });

    const deliveries = result[0];
    const totalCount = result[1];
    const totalPages = Math.ceil(totalCount / limit);

    return { deliveries, totalPages, totalCount };
  }

  @Post()
  async create(@Body() createDeliveryDto: CreateDeliveryDto) {
    // Delivery price set
    let subTotal = 0;
    let taxTotal = 0;
    let total = 0;

    // Iterate over every delivery item
    for (const deliveryDetail of createDeliveryDto.deliveryDetails) {
      // Add to price set
      subTotal += deliveryDetail.subTotal;
      taxTotal += deliveryDetail.subTotal * (deliveryDetail.taxRate / 100);
      total += deliveryDetail.total;

      // Update existing product's amount
      await this.productService.incrementAmount(
        deliveryDetail.productId,
        deliveryDetail.quantity,
      );
    }

    // Add total delivery price to supplier's total volume
    await this.supplierService.incrementTotalVolume(
      createDeliveryDto.supplierId,
      total,
    );

    // Create new delivery
    return this.deliveryService.create(createDeliveryDto, {
      subTotal,
      taxTotal,
      total,
    });
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    if (!id) {
      throw new BadRequestException();
    }

    return this.deliveryService.deleteById(id);
  }
}
