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

export type OrderType = 'BULK' | 'MANUAL';

@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, default: null })
  customerId: string | null;

  @Column({ type: 'varchar', length: 255, default: null })
  receiver: string | null;

  @Column({ type: 'int', default: null })
  deliveryAddressId: number | null;

  @Column({ type: 'int', nullable: false })
  orderNumber: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  orderId: string;

  @Column({
    type: 'datetime',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  deliveryDate: Date;

  @Column({ type: 'float', nullable: false, default: 0 })
  customerBalanceAfterOrder: number;

  @Column({ type: 'float', nullable: false })
  subTotal: number;

  @Column({ type: 'float', nullable: false })
  taxTotal: number;

  @Column({ type: 'float', nullable: false })
  total: number;

  @Column({ type: 'text', default: null })
  specialNote: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
    default: 'Belirsiz',
  })
  deliveryType: string;

  @Column({ type: 'varchar', length: 255, default: null })
  receiverNeighborhood: string | null;

  @Column({ type: 'text', default: null })
  receiverAddress: string | null;

  @Column({ type: 'varchar', length: 255, default: null })
  receiverProvince: string | null;

  @Column({ type: 'varchar', length: 255, default: null })
  receiverCity: string | null;

  @Column({ type: 'varchar', length: 255, default: null })
  receiverPhone: string | null;

  @Column({ type: 'text', default: null })
  cargoTrackNo: string | null;

  @Column({ type: 'varchar', length: 255, default: 'GÖNDERİLMEDİ' })
  status: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  type: OrderType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  manualInvoiceStatus: string | null;

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
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'customerId' })
  customer: Customer | null;

  @ManyToOne(
    () => DeliveryAddress,
    (deliveryAddress) => deliveryAddress.orders,
    {
      cascade: true,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'deliveryAddressId' })
  deliveryAddress: DeliveryAddress | null;

  @OneToMany(() => OrderProduct, (orderProduct) => orderProduct.order, {
    cascade: true,
  })
  orderProducts: OrderProduct[];
}
