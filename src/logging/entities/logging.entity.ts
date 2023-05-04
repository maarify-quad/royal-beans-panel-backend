import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

// Entities
import { Order } from 'src/order/entities/order.entity';
import { Product } from 'src/product/entities/product.entity';
import { User } from 'src/user/entities/user.entity';

@Entity({ name: 'logging' })
export class Logging {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  userId: number | null;

  @Column({ type: 'int', nullable: true })
  productId: number | null;

  @Column({ type: 'int', nullable: true })
  orderId: number | null;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'text', nullable: true })
  jsonParams: string | null;

  @Column({ type: 'varchar' })
  resource: LoggingResource;

  @Column({ type: 'varchar' })
  operation: LogginOperation;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User | null;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product | null;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'orderId' })
  order: Order | null;
}

export type LoggingResource =
  | 'unknown'
  | 'roast'
  | 'order'
  | 'product'
  | 'exit'
  | 'production'
  | 'stock'
  | 'parasut';
export type LogginOperation =
  | 'unknown'
  | 'create'
  | 'bulkCreate'
  | 'update'
  | 'delete';
