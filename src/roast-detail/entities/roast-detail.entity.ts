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
import { Roast } from 'src/roast/entities/roast.entity';
import { Product } from 'src/product/entities/product.entity';

@Entity({ name: 'roast_details' })
export class RoastDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  productId: number;

  @Column({ type: 'int', nullable: false })
  roastId: number;

  @Column({ type: 'text', nullable: false })
  roundId: string;

  @Column({ type: 'float', nullable: false })
  inputAmount: number;

  @Column({ type: 'float', nullable: false })
  outputAmount: number;

  @Column({ type: 'float', nullable: false })
  differenceAmount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Roast, (roast) => roast.roastDetails)
  @JoinColumn({ name: 'roastId' })
  roast: Roast;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;
}
