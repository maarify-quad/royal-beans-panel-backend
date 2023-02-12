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

@Entity({ name: 'roast_ingredients' })
export class RoastIngredient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  productId: number;

  @Column({ type: 'int' })
  ingredientId: number;

  @Column({ type: 'int' })
  rate: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Product, (product) => product.roastIngredients, {
    eager: true,
    cascade: true,
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ManyToOne(() => Product, {
    eager: true,
    cascade: true,
  })
  @JoinColumn({ name: 'ingredientId' })
  ingredient: Product;
}
