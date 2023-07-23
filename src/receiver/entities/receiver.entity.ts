import { Order } from 'src/order/entities/order.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'receivers' })
export class Receiver {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, default: null })
  neighborhood: string | null;

  @Column({ type: 'text', default: null })
  address: string | null;

  @Column({ type: 'varchar', length: 255, default: null })
  province: string | null;

  @Column({ type: 'varchar', length: 255, default: null })
  city: string | null;

  @Column({ type: 'varchar', length: 255, default: null })
  phone: string | null;

  @OneToMany(() => Order, (order) => order.receiver)
  orders: Order[];
}
