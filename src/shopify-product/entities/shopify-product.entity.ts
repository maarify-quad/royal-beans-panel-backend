import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// Entities
import { ShopifyProductToProduct } from './shopify-product-to-product.entity';

@Entity({ name: 'shopify_products' })
export class ShopifyProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint' })
  productId: number;

  @Column({ type: 'varchar', length: 255 })
  productTitle: string;

  @Column({ type: 'bigint' })
  variantId: number;

  @Column({ type: 'varchar', length: 255 })
  variantTitle: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(
    () => ShopifyProductToProduct,
    (shopifyProductToProduct) => shopifyProductToProduct.shopifyProduct,
  )
  ingredients: ShopifyProductToProduct[];
}
