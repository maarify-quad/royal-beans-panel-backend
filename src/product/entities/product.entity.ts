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

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  stockCode: string;

  @Column({ type: 'text', nullable: false })
  storageType: string;

  @Column({ type: 'float', nullable: false })
  amount: number;

  @Column({ type: 'text', nullable: false })
  amountUnit: string;

  @Column({ type: 'float', nullable: false, default: 0 })
  reservedAmount: number;

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
}
