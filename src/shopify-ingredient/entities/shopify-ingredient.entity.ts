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

@Entity({ name: 'shopify_ingredients' })
export class ShopifyIngredient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  productId: number;

  @Column({ type: 'int' })
  shopifyProductId: number;

  @Column({ type: 'int', nullable: true })
  shopifyVariantId: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Product, {
    eager: true,
  })
  @JoinColumn({ name: 'productId' })
  product: Product;
}
