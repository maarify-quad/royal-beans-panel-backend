import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { OrderModule } from 'src/order/order.module';

// Controllers
import { ParasutController } from './parasut.controller';

// Services
import { ParasutService } from './parasut.service';

@Module({
  imports: [HttpModule, OrderModule],
  controllers: [ParasutController],
  providers: [ParasutService],
  exports: [ParasutService],
})
export class ParasutModule {}
