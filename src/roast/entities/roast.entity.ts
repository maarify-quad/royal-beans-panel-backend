import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

// Entities
import { RoastDetail } from 'src/roast-detail/entities/roast-detail.entity';

@Entity({ name: 'roasts' })
export class Roast {
  @PrimaryColumn()
  id: string;

  @OneToMany(() => RoastDetail, (roastDetail) => roastDetail.roast, {
    cascade: true,
  })
  @JoinColumn()
  roastDetails: RoastDetail[];

  @Column({ type: 'datetime', nullable: false })
  date: Date;

  @Column({ type: 'float', nullable: false })
  totalInputAmount: number;

  @Column({ type: 'float', nullable: false })
  totalOutputAmount: number;

  @Column({ type: 'float', nullable: false })
  totalDifferenceAmount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
