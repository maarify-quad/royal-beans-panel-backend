import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { Receiver } from './entities/receiver.entity';
import { CreateReceiverDTO } from './dto/create-receiver.dto';

@Injectable()
export class ReceiverService {
  constructor(
    @InjectRepository(Receiver)
    private readonly receiverRepository: Repository<Receiver>,
  ) {}

  async findAll() {
    return await this.receiverRepository.find();
  }

  async findByPagination(
    query: {
      page?: string;
      limit?: string;
    },
    options?: FindManyOptions<Receiver>,
  ) {
    const page = query.page ? parseInt(query.page, 10) : null;
    const limit = query.limit ? parseInt(query.limit, 10) : null;

    const order = {
      name: 'DESC',
    } as const;

    if (!page || !limit) {
      const receivers = await this.receiverRepository.find({
        ...options,
        order,
      });
      return { receivers, totalPages: 1, totalCount: receivers.length };
    }

    const result = await this.receiverRepository.findAndCount({
      ...options,
      order,
      take: limit,
      skip: (page - 1) * limit,
    });

    const receivers = result[0];
    const totalCount = result[1];
    const totalPages = Math.ceil(totalCount / limit);

    return { receivers, totalPages, totalCount };
  }

  async create(dto: CreateReceiverDTO) {
    const receiver = this.receiverRepository.create(dto);
    return await this.receiverRepository.save(receiver);
  }
}
