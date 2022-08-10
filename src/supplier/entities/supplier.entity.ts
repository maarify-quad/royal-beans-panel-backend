import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

// Entities
import { Delivery } from 'src/delivery/entities/delivery.entity';

@Entity({ name: 'suppliers' })
export class Supplier {
  @PrimaryColumn()
  id: string;

  @OneToMany(() => Delivery, (delivery) => delivery.supplier, {
    cascade: true,
  })
  deliveries: Delivery[];

  @Column({ type: 'text', nullable: false })
  name: string;

  @Column({ type: 'text', default: null })
  address: string;

  @Column({ type: 'varchar', length: 255, default: null })
  taxNo: string;

  @Column({ type: 'varchar', length: 255, default: null })
  taxOffice: string;

  @Column({ type: 'varchar', length: 255, default: null })
  contactName: string;

  @Column({ type: 'varchar', length: 255, default: null })
  contactPosition: string;

  @Column({ type: 'varchar', length: 255, default: null })
  contactPhone: string;

  @Column({ type: 'varchar', length: 255, default: null })
  contactEmail: string;

  @Column({ type: 'float', nullable: false, default: 0 })
  totalVolume: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
