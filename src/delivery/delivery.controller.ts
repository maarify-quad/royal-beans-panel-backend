import {
  Body,
  Controller,
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
    if (!query.limit && !query.page) {
      const deliveries = await this.deliveryService.findAll({
        relations: { supplier: true },
        order: { id: 'DESC' },
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
    return this.deliveryService.findOneById(id);
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

  @Post()
  async create(@Body() createDeliveryDto: CreateDeliveryDto) {
    // If supplier id starts with `NEW_` prefix, it means a new supplier is created on client-side so create new supplier and save it
    if (createDeliveryDto.supplierId.startsWith('NEW_')) {
      const newSupplier = await this.supplierService.create({
        name: createDeliveryDto.supplierId.split('NEW_')[1],
      });
      createDeliveryDto.supplierId = newSupplier.id;
    }

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

      // If product id is less than 1 it means a new product is created on client-side so create new product and save it
      if (deliveryDetail.productId < 1) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...createProduct } = deliveryDetail.product;

        // Create new product
        const newProduct = await this.productService.create(createProduct);
        console.log(newProduct);

        // Set product id to new product id
        deliveryDetail.productId = newProduct.id;
        deliveryDetail.product.id = newProduct.id;
        deliveryDetail.product.stockCode = newProduct.stockCode;
      } else {
        // Update existing product's amount
        await this.productService.incrementAmount(
          deliveryDetail.productId,
          deliveryDetail.quantity,
        );
      }
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
}
