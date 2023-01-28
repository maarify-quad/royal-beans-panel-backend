import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

// Entities
import { Product } from 'src/product/entities/product.entity';

@Entity({ name: 'ingredients' })
export class Ingredient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  productId: number;

  @Column({ type: 'int' })
  ingredientProductId: number;

  @Column({ type: 'float' })
  ratio: number;

  @ManyToOne(() => Product, (product) => product.ingredients, {
    eager: true,
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ManyToOne(() => Product, {
    eager: true,
  })
  @JoinColumn({ name: 'ingredientProductId' })
  ingredientProduct: Product;
}
