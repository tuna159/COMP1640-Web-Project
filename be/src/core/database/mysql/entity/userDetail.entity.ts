import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_detail')
export class UserDetail {
  @PrimaryColumn('uuid', { name: 'user_id' })
  user_id: string;

  @Column({ name: 'full_name', type: 'varchar', length: 255 })
  full_name: string;

  @Column({ name: 'nick_name', type: 'varchar', length: 255, default: null })
  nick_name: string;

  @Column({
    name: 'gender',
    type: 'int',
    default: 0,
    unsigned: true,
    comment: '0: Prefer not to say, 1: Male, 2: Female',
  })
  gender: number;

  @Column({ name: 'birthday', type: 'date', default: null })
  birthday: Date;

  @Column({ name: 'avatar_url', type: 'varchar', length: 300, default: null })
  avatar_url: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @OneToOne(() => User, (user) => user.userDetail, { onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'user_id' })
  user: User;
}
