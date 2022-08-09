import { Product } from 'src/product/entities/product.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'blends' })
export class Blend {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  inputProductId: number;

  @Column({ type: 'int', nullable: false })
  outputProductId: number;

  @Column({ type: 'float', nullable: false })
  rate: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Product, (product) => product.inputBlends, {
    cascade: true,
  })
  @JoinColumn({ name: 'inputProductId' })
  inputProduct: Product;

  @ManyToOne(() => Product, (product) => product.outputBlends, {
    cascade: true,
  })
  @JoinColumn({ name: 'outputProductId' })
  outputProduct: Product;
}
