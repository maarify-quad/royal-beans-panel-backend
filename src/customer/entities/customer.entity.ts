import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

// Entities
import { PriceList } from 'src/price-list/entities/price-list.entity';
import { Order } from 'src/order/entities/order.entity';
import { DeliveryAddress } from 'src/delivery-address/entities/delivery-address.entity';

@Entity({ name: 'customers' })
export class Customer {
  @PrimaryColumn()
  id: string;

  @Column({ type: 'number', default: null })
  priceListId: number | null;

  @Column({ type: 'text', nullable: false })
  name: string;

  @Column({ type: 'text', default: null })
  companyTitle?: string;

  @Column({ type: 'varchar', length: 255, default: null })
  contactName?: string;

  @Column({ type: 'varchar', length: 255, default: null })
  contactTitle?: string;

  @Column({ type: 'varchar', length: 255, default: null })
  secondContactName?: string;

  @Column({ type: 'varchar', length: 255, default: null })
  secondContactTitle?: string;

  @Column({ type: 'varchar', length: 255, default: null })
  email?: string;

  @Column({ type: 'varchar', length: 255, default: null })
  phone?: string;

  @Column({ type: 'text', default: null })
  address?: string;

  @Column({ type: 'varchar', length: 255, default: null })
  province?: string;

  @Column({ type: 'varchar', length: 255, default: null })
  city?: string;

  @Column({ type: 'text', default: null })
  cargoAddress?: string;

  @Column({ type: 'varchar', length: 255, default: null })
  cargoProvince?: string;

  @Column({ type: 'varchar', length: 255, default: null })
  cargoCity?: string;

  @Column({ type: 'varchar', length: 255, default: null })
  taxOffice?: string;

  @Column({ type: 'varchar', length: 255, default: null })
  taxNo?: string;

  @Column({ type: 'float', default: 0 })
  startBalance: number;

  @Column({ type: 'float', default: 0 })
  currentBalance: number;

  @Column({ type: 'varchar', length: 255, default: null })
  commercialPrinciple?: string;

  @Column({ type: 'text', default: null })
  comment?: string;

  @Column({ type: 'text', default: null })
  specialNote?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => PriceList, (priceList) => priceList.customers, {
    cascade: true,
  })
  @JoinColumn({ name: 'priceListId' })
  priceList: PriceList | null;

  @OneToMany(() => Order, (order) => order.customer)
  orders: Order[];

  @OneToMany(
    () => DeliveryAddress,
    (deliveryAddress) => deliveryAddress.customer,
    { cascade: true, eager: true },
  )
  deliveryAddresses: DeliveryAddress[];
}
