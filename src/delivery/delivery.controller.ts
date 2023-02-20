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
  async getDeliveries(@Query() query: GetDeliveriesDto) {
    return await this.deliveryService.findByPagination(query, {
      relations: { supplier: true },
      withDeleted: query.withDeleted === 'true',
    });
  }

  @Get(':id')
  getDeliveryById(@Param('id') id: string) {
    return this.deliveryService.findOneById(id, { withDeleted: true });
  }

  @Get('/product/:stockCode')
  async getProductDeliveryDetails(
    @Query() query: GetDeliveriesDto,
    @Param('stockCode') stockCode: string,
  ) {
    const { deliveries, totalCount, totalPages } =
      await this.deliveryService.findByPagination(query, {
        where: { deliveryDetails: { product: { stockCode } } },
        relations: {
          deliveryDetails: { product: true, delivery: { supplier: true } },
        },
        withDeleted: true,
      });

    const deliveryDetails = deliveries
      .map((delivery) => {
        const deliveryDetails = delivery.deliveryDetails.filter(
          (deliveryDetail) => deliveryDetail.product.stockCode === stockCode,
        );

        return deliveryDetails;
      })
      .flat();

    return { deliveryDetails, totalPages, totalCount };
  }

  @Get('/supplier/:id')
  async getSupplierDeliveries(
    @Query() query: GetDeliveriesDto,
    @Param('id') id: string,
  ) {
    return await this.deliveryService.findByPagination(query, {
      where: { supplierId: id },
      withDeleted: query.withDeleted === 'true',
    });
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
