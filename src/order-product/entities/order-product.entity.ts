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
import { Order } from 'src/order/entities/order.entity';
import { PriceListProduct } from 'src/price-list-product/entities/price-list-product.entity';
import { Product } from 'src/product/entities/product.entity';

@Entity({ name: 'order_products' })
export class OrderProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  orderId: number;

  @Column({ type: 'int', nullable: true, default: null })
  priceListProductId: number | null;

  @Column({ type: 'int', nullable: true, default: null })
  productId: number | null;

  @Column({ type: 'varchar', length: 255, nullable: false })
  grindType: string;

  @Column({ type: 'float', nullable: false })
  unitPrice: number;

  @Column({ type: 'int', nullable: false })
  quantity: number;

  @Column({ type: 'float', nullable: false })
  taxRate: number;

  @Column({ type: 'float', nullable: false })
  subTotal: number;

  @Column({ type: 'float', nullable: false })
  total: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @ManyToOne(() => PriceListProduct)
  @JoinColumn({ name: 'priceListProductId' })
  priceListProduct: PriceListProduct | null;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product | null;
}
