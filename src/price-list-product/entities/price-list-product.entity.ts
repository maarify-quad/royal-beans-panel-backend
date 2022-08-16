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
import { PriceList } from 'src/price-list/entities/price-list.entity';

@Entity({ name: 'price_list_products' })
export class PriceListProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  productId: number;

  @Column({ type: 'int', nullable: false })
  priceListId: number;

  @Column({ type: 'float', nullable: false })
  unitPrice: number;

  @Column({ type: 'float', nullable: false })
  taxRate: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ManyToOne(() => PriceList)
  @JoinColumn({ name: 'priceListId' })
  priceList: PriceList;
}
