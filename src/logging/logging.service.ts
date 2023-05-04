import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';

// Entities
import {
  LogginOperation,
  Logging,
  LoggingResource,
} from './entities/logging.entity';

@Injectable()
export class LoggingService {
  constructor(
    @InjectRepository(Logging)
    private readonly loggingRepo: Repository<Logging>,
  ) {}

  async findAll(options?: FindManyOptions<Logging>) {
    return await this.loggingRepo.find(options);
  }

  async create({
    userId,
    productId,
    orderId,
    message,
    jsonParams,
    resource,
    operation,
  }: {
    userId?: number;
    productId?: number;
    orderId?: number;
    message: string;
    jsonParams?: string;
    resource: LoggingResource;
    operation: LogginOperation;
  }) {
    const log = this.loggingRepo.create({
      userId: userId ?? null,
      productId: productId ?? null,
      orderId: orderId ?? null,
      jsonParams: jsonParams ?? null,
      message,
      resource,
      operation,
    });
    await this.loggingRepo.save(log);
    return log;
  }
}
