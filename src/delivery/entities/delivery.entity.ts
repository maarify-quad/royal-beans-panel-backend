import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

// Entities
import { Supplier } from 'src/supplier/entities/supplier.entity';
import { DeliveryDetail } from 'src/delivery-detail/entities/delivery-detail.entity';

@Entity({ name: 'deliveries' })
export class Delivery {
  @PrimaryColumn()
  id: string;

  @OneToMany(
    () => DeliveryDetail,
    (deliveryDetail) => deliveryDetail.delivery,
    {
      cascade: true,
    },
  )
  @JoinColumn()
  deliveryDetails: DeliveryDetail[];

  @ManyToOne(() => Supplier, (supplier) => supplier.deliveries)
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  @Column({ type: 'text', nullable: false })
  supplierId: string;

  @Column({ type: 'datetime', nullable: false })
  deliveryDate: Date;

  @Column({ type: 'datetime', nullable: false })
  invoiceDate: Date;

  @Column({ type: 'float', nullable: false })
  subTotal: number;

  @Column({ type: 'float', nullable: false })
  taxTotal: number;

  @Column({ type: 'float', nullable: false })
  total: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
