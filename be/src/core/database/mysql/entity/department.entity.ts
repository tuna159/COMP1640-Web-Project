import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from './role.entity';
import { User } from './user.entity';

@Entity('department')
export class Department {
  @PrimaryGeneratedColumn({
    name: 'department_id',
    type: 'int',
    unsigned: true,
  })
  department_id: number;

  @Column({ name: 'manager_id', default: null })
  manager_id: string;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @OneToOne(() => User, { onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'manager_id', referencedColumnName: 'user_id' })
  manager: User;

  @OneToMany(() => User, (user) => user.department)
  users: User[];
}
