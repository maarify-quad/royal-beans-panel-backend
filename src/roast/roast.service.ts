import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Services
import { BlendService } from 'src/blend/blend.service';

// Entities
import { Roast } from './entities/roast.entity';

// DTOs
import { CreateRoastDto } from './dto/create-roast.dto';
import { RoastDetail } from 'src/roast-detail/entities/roast-detail.entity';

@Injectable()
export class RoastService {
  constructor(
    @InjectRepository(Roast)
    private readonly roastRepository: Repository<Roast>,
    private readonly blendService: BlendService,
  ) {}

  async findAll(): Promise<Roast[]> {
    return await this.roastRepository.find();
  }

  async findById(id: string): Promise<Roast> {
    return await this.roastRepository.findOne({
      where: { id },
      relations: {
        roastDetails: {
          product: true,
        },
      },
    });
  }

  async createRoast(createRoastDto: CreateRoastDto): Promise<Roast> {
    // Find latest roast id
    const [lastRoast] = await this.roastRepository.find({
      order: { id: 'DESC' },
      take: 1,
    });

    // Generate new roast id
    const id = lastRoast
      ? `K${Number(lastRoast.id.split('K')[1]) + 1}`
      : 'K1001';

    // Calculate total roasting amounts
    let totalInputAmount = 0;
    let totalOutputAmount = 0;
    let totalDifferenceAmount = 0;

    createRoastDto.roastDetails.forEach((roastDetail) => {
      roastDetail.forEach((detail) => {
        totalInputAmount += detail.inputAmount;
        totalOutputAmount += detail.outputAmount;
        totalDifferenceAmount += detail.inputAmount - detail.outputAmount;
      });
    });

    // Create new roast
    const newRoast = this.roastRepository.create({
      id,
      date: new Date(),
      totalInputAmount,
      totalOutputAmount,
      totalDifferenceAmount,
    });

    // Create roast details
    const roastDetails: RoastDetail[] = [];
    for (const [index, roundDetails] of createRoastDto.roastDetails.entries()) {
      for (const roastDetail of roundDetails) {
        await this.blendService.blend(
          roastDetail.productId,
          roastDetail.inputAmount,
          roastDetail.outputAmount,
        );

        roastDetails.push({
          ...roastDetail,
          roundId: `${id}P${index + 1}`,
          differenceAmount: roastDetail.inputAmount - roastDetail.outputAmount,
        });
      }
    }

    // Save roast details
    newRoast.roastDetails = roastDetails;

    // Save new roast
    return await this.roastRepository.save(newRoast);
  }
}
