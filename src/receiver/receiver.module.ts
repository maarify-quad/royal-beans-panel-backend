import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { ReceiverController } from './receiver.controller';

// Services
import { ReceiverService } from './receiver.service';

// Entities
import { Receiver } from './entities/receiver.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Receiver])],
  controllers: [ReceiverController],
  providers: [ReceiverService],
  exports: [ReceiverService],
})
export class ReceiverModule {}
