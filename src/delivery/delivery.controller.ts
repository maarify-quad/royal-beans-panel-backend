import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
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
import { Response } from 'express';

@Controller('deliveries')
export class DeliveryController {
  constructor(
    private readonly deliveryService: DeliveryService,
    private readonly supplierService: SupplierService,
    private readonly productService: ProductService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Res({ passthrough: true }) res: Response,
    @Query() query?: GetDeliveriesDto,
  ): Promise<any> {
    // Test
    res.cookie('test', 'testValue', {
      sameSite: 'lax',
      httpOnly: true,
      secure: true,
    });

    // If no query is provided, return all deliveries
    if (!query) {
      const deliveries = await this.deliveryService.findAll({
        relations: {
          supplier: true,
        },
        order: {
          id: 'DESC',
        },
      });
      return { deliveries };
    }

    // Parse query params
    const limit = parseInt(query.limit, 10) || 50;
    const page = parseInt(query.page, 10) || 1;

    // If query is provided, return deliveries matching query
    const result = await this.deliveryService.findAndCount({
      relations: {
        supplier: true,
      },
      take: limit,
      skip: limit * (page - 1),
      order: {
        id: 'DESC',
      },
    });

    // Return deliveries and total count
    const deliveries = result[0];
    const total: number = result[1];
    const totalPage = Math.ceil(total / limit);

    // End response
    return { deliveries, totalPage };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOneById(@Param('id') id: string): Promise<any> {
    return this.deliveryService.findOneById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createDeliveryDto: CreateDeliveryDto): Promise<any> {
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

      // If product id is negative it means a new product is created on client-side so create new product and save it
      if (deliveryDetail.productId <= 0) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...createProduct } = deliveryDetail.product;

        // Create new product
        const newProduct = await this.productService.create(createProduct);

        // Set product id to new product id
        deliveryDetail.productId = newProduct.id;
        deliveryDetail.product.id = newProduct.id;
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
