import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// Entities
import { DeliveryDetail } from 'src/delivery-detail/entities/delivery-detail.entity';
import { Ingredient } from 'src/ingredient/entities/ingredient.entity';
import { RoastDetail } from 'src/roast-detail/entities/roast-detail.entity';
import { RoastIngredient } from 'src/roast-ingredient/entities/roast-ingredient.entity';
import { ShopifyProductToProduct } from 'src/shopify-product/entities/shopify-product-to-product.entity';

export type ProductSource =
  | 'dashboard'
  | 'shopify'
  | 'trendyol'
  | 'hepsiburada';

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  stockCode: string;

  @Column({ type: 'text' })
  storageType: string;

  @Column({ type: 'float' })
  amount: number;

  @Column({ type: 'text' })
  amountUnit: string;

  @Column({ type: 'float', default: 0 })
  unitCost: number;

  @Column({ type: 'float', default: 0 })
  reservedAmount: number;

  @Column({ type: 'float', nullable: true, default: null })
  weight: number | null;

  @Column({ type: 'float', nullable: true, default: null })
  deci: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  tag: string | null;

  @Column({ type: 'varchar', length: 255, default: 'dashboard' })
  source: ProductSource;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @OneToMany(() => DeliveryDetail, (deliveryDetail) => deliveryDetail.product)
  deliveryDetails: DeliveryDetail[];

  @OneToMany(
    () => RoastIngredient,
    (roastIngredient) => roastIngredient.product,
  )
  roastIngredients: RoastIngredient[];

  @OneToMany(() => RoastDetail, (roastDetail) => roastDetail.product, {
    cascade: true,
  })
  roastDetails: RoastDetail[];

  @OneToMany(() => Ingredient, (ingredient) => ingredient.product)
  ingredients: Ingredient[];

  @OneToMany(
    () => ShopifyProductToProduct,
    (shopifyIngredientToProduct) => shopifyIngredientToProduct.product,
  )
  shopifyProducts: ShopifyProductToProduct[];
}
