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
import { Delivery } from 'src/delivery/entities/delivery.entity';
import { Product } from 'src/product/entities/product.entity';

@Entity({ name: 'delivery_details' })
export class DeliveryDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Delivery, (delivery) => delivery.deliveryDetails, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'deliveryId' })
  delivery: Delivery;

  @ManyToOne(() => Product, {
    cascade: true,
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'int', nullable: false })
  productId: number;

  @Column({ type: 'text', nullable: false })
  deliveryId: string;

  @Column({ type: 'float', nullable: false })
  quantity: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  unit: string;

  @Column({ type: 'float', nullable: false })
  unitPriceUSD: number;

  @Column({ type: 'float', nullable: false })
  unitPriceTRY: number;

  @Column({ type: 'int', nullable: false })
  taxRate: number;

  @Column({ type: 'float', nullable: false })
  subTotal: number;

  @Column({ type: 'float', nullable: false })
  taxTotal: number;

  @Column({ type: 'float', nullable: false })
  total: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
