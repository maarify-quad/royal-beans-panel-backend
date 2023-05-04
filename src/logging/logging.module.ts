import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { LoggingController } from './logging.controller';

// Services
import { LoggingService } from './logging.service';

// Entities
import { Logging } from './entities/logging.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Logging])],
  controllers: [LoggingController],
  providers: [LoggingService],
  exports: [LoggingService],
})
export class LoggingModule {}
