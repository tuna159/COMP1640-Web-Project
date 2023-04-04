import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Event } from './event.entity';
import { User } from './user.entity';

@Entity('department')
export class Department {
  @PrimaryGeneratedColumn({
    name: 'department_id',
    type: 'int',
    unsigned: true,
  })
  department_id: number;

  @Column({ name: 'manager_id', unique: true, default: null, nullable: true })
  manager_id: string;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @OneToOne(() => User, { onUpdate: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'manager_id', referencedColumnName: 'user_id' })
  manager: User;

  @OneToMany(() => User, (user) => user.department)
  users: User[];

  @OneToMany(() => Event, (event) => event.department)
  events: Event[];
}
