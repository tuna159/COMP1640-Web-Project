import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('role')
export class Role {
  @PrimaryGeneratedColumn({ name: 'role_id', type: 'int', unsigned: true })
  role_id: number;

  @Column({ name: 'name', type: 'varchar', length: '100' })
  name: string;

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
