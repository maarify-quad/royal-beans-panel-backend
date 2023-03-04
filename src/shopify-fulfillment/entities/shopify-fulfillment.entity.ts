import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'shopify_fulfillments' })
export class ShopifyFulfillment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  orderId: string;

  @CreateDateColumn()
  createdAt: Date;
}
