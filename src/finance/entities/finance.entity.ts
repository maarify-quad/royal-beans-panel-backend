import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'finance' })
export class Finance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column()
  totalRevenue: number;

  @Column()
  totalCost: number;

  @Column()
  sentCost: number;

  @Column()
  financialStatus: number;

  @Column()
  profitLossRatio: number;

  // START MANUEL INPUT

  @Column()
  totalConstantExpense: number;

  @Column()
  marketingExpense: number;

  @Column()
  generalCost: number;

  @Column()
  totalAdditionalExpense: number;

  @Column()
  totalAdditionalRevenue: number;

  // END MANUEL INPUT

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
