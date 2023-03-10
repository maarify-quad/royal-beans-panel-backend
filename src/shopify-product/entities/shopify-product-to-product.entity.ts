import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// Entities
import { Product } from 'src/product/entities/product.entity';
import { ShopifyProduct } from './shopify-product.entity';

@Entity()
export class ShopifyProductToProduct {
  @PrimaryGeneratedColumn()
  shopifyProductToProductId: number;

  @Column()
  shopifyProductId: number;

  @Column()
  productId: number;

  @Column({ type: 'float' })
  quantity: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(
    () => ShopifyProduct,
    (shopifyIngredient) => shopifyIngredient.ingredients,
  )
  shopifyProduct: ShopifyProduct;

  @ManyToOne(() => Product, (product) => product.shopifyProducts)
  product: Product;
}
