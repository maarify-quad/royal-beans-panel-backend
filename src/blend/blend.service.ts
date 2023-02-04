import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Services
import { ProductService } from 'src/product/product.service';

// Entities
import { Blend } from './entities/blend.entity';

@Injectable()
export class BlendService {
  constructor(
    @InjectRepository(Blend)
    private readonly blendRepository: Repository<Blend>,
    private readonly productService: ProductService,
  ) {}

  async blend(
    outputProductId: number,
    inputAmount: number,
    outputAmount: number,
  ) {
    const blends = await this.blendRepository.find({
      where: { outputProductId },
      relations: { outputProduct: true, inputProduct: true },
    });

    if (blends.length > 0) {
      await this.productService.incrementAmount(
        blends[0].outputProductId,
        outputAmount,
      );
    }

    for (const blend of blends) {
      const decrementAmount = inputAmount * (blend.rate / 100);

      await this.productService.decrementAmount(
        blend.inputProductId,
        decrementAmount,
      );
    }
  }
}
