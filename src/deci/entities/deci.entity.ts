import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'decis' })
export class Deci {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, type: 'float' })
  value: number;

  @Column({ type: 'float' })
  price: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
