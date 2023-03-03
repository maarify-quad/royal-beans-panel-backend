import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// Entities
import { Customer } from 'src/customer/entities/customer.entity';
import { PriceListProduct } from 'src/price-list-product/entities/price-list-product.entity';

@Entity({ name: 'price_lists' })
export class PriceList {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 255, default: null })
  description: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Customer, (customer) => customer.priceList)
  @JoinColumn()
  customers: Customer[];

  @OneToMany(() => PriceListProduct, (product) => product.priceList, {
    cascade: true,
  })
  @JoinColumn()
  priceListProducts: PriceListProduct[];
}
