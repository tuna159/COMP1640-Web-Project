import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Department } from './department.entity';
import { Idea } from './idea.entity';

@Entity('event')
export class Event {
  @PrimaryGeneratedColumn({ name: 'event_id', type: 'int', unsigned: true })
  event_id: number;

  @Column({ name: 'department_id', type: 'int', unsigned: true, nullable: true, default: null })
  department_id: number;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'content', type: 'varchar', length: 1000 })
  content: string;

  @CreateDateColumn({ name: 'created_date', type: 'timestamp' })
  created_date: Date;

  @Column({ name: 'first_closure_date', type: 'timestamp', default: null })
  first_closure_date: Date;

  @Column({ name: 'final_closure_date', type: 'timestamp', default: null })
  final_closure_date: Date;

  @ManyToOne(() => Department, (department) => department.events, {
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'department_id', referencedColumnName: 'department_id' })
  department: Department;

  @OneToMany(() => Idea, (idea) => idea.event)
  ideas: Idea[];
}
