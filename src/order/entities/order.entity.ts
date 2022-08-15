import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// Entities
import { Customer } from 'src/customer/entities/customer.entity';
import { OrderProduct } from 'src/order-product/entities/order-product.module';

@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  customerId: number;

  @Column({ type: 'int', nullable: false })
  orderNumber: number;

  @Column({ type: 'datetime', nullable: false })
  deliveryDate: Date;

  @Column({ type: 'float', nullable: false })
  customerBalanceAfterOrder: number;

  @Column({ type: 'float', nullable: false })
  subTotal: number;

  @Column({ type: 'float', nullable: false })
  taxTotal: number;

  @Column({ type: 'float', nullable: false })
  total: number;

  @Column({ type: 'text', default: null })
  specialNote: string | null;

  @Column({ type: 'varchar', length: 255, nullable: false })
  deliveryType: string;

  @Column({ type: 'text', default: null })
  cargoTrackNo: string | null;

  @Column({ type: 'varchar', length: 255, default: 'GÖNDERİLMEDİ' })
  status: string;

  @Column({ type: 'boolean', default: false })
  isParasutVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Customer, (customer) => customer.orders)
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @OneToMany(() => OrderProduct, (orderProduct) => orderProduct.order, {
    cascade: true,
  })
  orderProducts: OrderProduct[];
}
