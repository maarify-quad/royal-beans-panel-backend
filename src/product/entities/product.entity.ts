import { Blend } from 'src/blend/entities/blend.entity';
import { RoastDetail } from 'src/roast-detail/entities/roast-detail.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true, default: null })
  stockCode: string | null;

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

  @OneToMany(() => Blend, (blend) => blend.outputProduct)
  outputBlends: Blend[];

  @OneToMany(() => Blend, (blend) => blend.inputProduct)
  inputBlends: Blend[];

  @OneToMany(() => RoastDetail, (roastDetail) => roastDetail.product, {
    cascade: true,
  })
  roastDetails: RoastDetail[];
}
