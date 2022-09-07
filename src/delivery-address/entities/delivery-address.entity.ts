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

  @Column({ type: 'varchar', nullable: false })
  customerId: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  receiverName: string;

  @Column({ type: 'text', nullable: false })
  receiverAddress: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  receiverPhone: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  receiverProvince: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  receiverCity: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Customer, (customer) => customer.deliveryAddresses)
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @OneToMany(() => Order, (order) => order.deliveryAddress)
  orders: Order[];
}
