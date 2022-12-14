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
import { OrderProduct } from 'src/order-product/entities/order-product.entity';
import { DeliveryAddress } from 'src/delivery-address/entities/delivery-address.entity';

@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  customerId: string;

  @Column({ type: 'int', default: null })
  deliveryAddressId: number | null;

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

  @Column({ type: 'boolean', default: false })
  isCancelled: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Customer, (customer) => customer.orders, {
    cascade: true,
  })
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @ManyToOne(
    () => DeliveryAddress,
    (deliveryAddress) => deliveryAddress.orders,
    {
      cascade: true,
    },
  )
  @JoinColumn({ name: 'deliveryAddressId' })
  deliveryAddress: DeliveryAddress;

  @OneToMany(() => OrderProduct, (orderProduct) => orderProduct.order, {
    cascade: true,
  })
  orderProducts: OrderProduct[];
}
