import { EIsDelete } from 'enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CategoryIdea } from './categoryIdea.entity';
import { Comment } from './comment.entity';
import { IdeaFile } from './file.entity';
import { Reaction } from './reaction.entity';
import { Event } from './event.entity';
import { User } from './user.entity';
import { IdeaTag } from './ideaTag.entity';

@Entity('idea')
export class Idea {
  @PrimaryGeneratedColumn({ name: 'idea_id', type: 'int', unsigned: true })
  idea_id: number;

  @Column('uuid', { name: 'user_id' })
  user_id: string;

  @Column({ name: 'event_id', type: 'int', unsigned: true })
  event_id: number;

  @Column({ name: 'title', type: 'varchar', length: 100 })
  title: string;

  @Column({ name: 'content', type: 'varchar', length: 800 })
  content: string;

  @Column({ name: 'views', type: 'int', unsigned: true, default: 0 })
  views: number;

  @Column({
    name: 'is_anonymous',
    type: 'tinyint',
    unsigned: true,
    default: 0,
    comment: '0: not anonymous, 1: anonymous',
  })
  is_anonymous: number;

  @Column({
    name: 'is_deleted',
    type: 'tinyint',
    width: 1,
    comment: '0: not deleted, 1: deleted',
    default: EIsDelete.NOT_DELETE,
  })
  is_deleted: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.ideas, { onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'user_id' })
  user: User;

  @ManyToOne(() => Event, (event) => event.ideas, {
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id', referencedColumnName: 'event_id' })
  event: Event;

  @OneToMany(() => Comment, (comment) => comment.idea)
  comments: Comment[];

  @OneToMany(() => IdeaFile, (file) => file.idea)
  files: IdeaFile[];

  @OneToMany(() => CategoryIdea, (categoryIdea) => categoryIdea.idea)
  ideaCategories: CategoryIdea[];

  @OneToMany(() => IdeaTag, (ideaTag) => ideaTag.idea)
  ideaTags: IdeaTag[];

  @OneToMany(() => Reaction, (reaction) => reaction.idea)
  reactions: Reaction[];
}
