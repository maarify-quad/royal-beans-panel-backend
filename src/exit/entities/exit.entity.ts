import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// Entities

import { Product } from 'src/product/entities/product.entity';
import { Order } from 'src/order/entities/order.entity';

@Entity({ name: 'exits' })
export class Exit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'datetime' })
  date: Date;

  @Column({ type: 'int', nullable: true, default: null })
  orderId: number | null;

  @Column({ type: 'int' })
  productId: number;

  @Column({ type: 'float' })
  amount: number;

  @Column({ type: 'float' })
  storageAmountAfterExit: number;

  @Column({ type: 'varchar', length: 255 })
  type: ExitType;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Order, {
    cascade: true,
  })
  @JoinColumn({ name: 'orderId' })
  order: Order | null;

  @ManyToOne(() => Product, {
    cascade: true,
  })
  @JoinColumn({ name: 'productId' })
  product: Product;
}

export type ExitType = 'order' | 'unknown';
