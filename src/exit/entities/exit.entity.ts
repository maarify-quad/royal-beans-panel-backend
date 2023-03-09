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
import { Customer } from 'src/customer/entities/customer.entity';
import { Product } from 'src/product/entities/product.entity';

@Entity({ name: 'exits' })
export class Exit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'datetime' })
  date: Date;

  @Column({ type: 'varchar', length: 255 })
  action: string;

  @Column({ type: 'int' })
  productId: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  customerId: string | null;

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

  @ManyToOne(() => Customer, {
    cascade: true,
  })
  @JoinColumn({ name: 'customerId' })
  customer: Customer | null;

  @ManyToOne(() => Product, {
    cascade: true,
  })
  @JoinColumn({ name: 'productId' })
  product: Product;
}

export type ExitType = 'order' | 'unknown';
