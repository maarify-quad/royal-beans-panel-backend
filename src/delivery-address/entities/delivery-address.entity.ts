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
import { Order } from 'src/order/entities/order.entity';

@Entity({ name: 'delivery_addresses' })
export class DeliveryAddress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  customerId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255 })
  receiverName: string;

  @Column({ type: 'text' })
  receiverAddress: string;

  @Column({ type: 'varchar', length: 255 })
  receiverPhone: string;

  @Column({ type: 'varchar', length: 255 })
  receiverProvince: string;

  @Column({ type: 'varchar', length: 255 })
  receiverCity: string;

  @Column({ type: 'bool', default: false })
  isPrimary: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Customer, (customer) => customer.deliveryAddresses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @OneToMany(() => Order, (order) => order.deliveryAddress)
  orders: Order[];
}
