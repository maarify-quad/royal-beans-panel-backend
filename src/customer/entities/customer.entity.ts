import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'customers' })
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: false })
  name: string;

  @Column({ type: 'text', default: null })
  companyTitle?: string;

  @Column({ type: 'varchar', length: 255, default: null })
  contactName?: string;

  @Column({ type: 'varchar', length: 255, default: null })
  contactTitle?: string;

  @Column({ type: 'varchar', length: 255, default: null })
  secondContactName?: string;

  @Column({ type: 'varchar', length: 255, default: null })
  secondContactTitle?: string;

  @Column({ type: 'varchar', length: 255, default: null })
  email?: string;

  @Column({ type: 'varchar', length: 255, default: null })
  phone?: string;

  @Column({ type: 'text', default: null })
  address?: string;

  @Column({ type: 'varchar', length: 255, default: null })
  province?: string;

  @Column({ type: 'varchar', length: 255, default: null })
  city?: string;

  @Column({ type: 'text', default: null })
  cargoAddress?: string;

  @Column({ type: 'varchar', length: 255, default: null })
  cargoProvince?: string;

  @Column({ type: 'varchar', length: 255, default: null })
  cargoCity?: string;

  @Column({ type: 'varchar', length: 255, default: null })
  taxOffice?: string;

  @Column({ type: 'varchar', length: 255, default: null })
  taxNo?: string;

  @Column({ type: 'float', default: 0 })
  startBalance: number;

  @Column({ type: 'float', default: 0 })
  currentBalance: number;

  @Column({ type: 'varchar', length: 255, default: null })
  commercialPrinciple?: string;

  @Column({ type: 'text', default: null })
  comment?: string;

  @Column({ type: 'text', default: null })
  specialNote?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
