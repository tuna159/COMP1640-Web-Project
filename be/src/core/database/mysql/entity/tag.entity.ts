import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { IdeaTag } from './ideaTag.entity';

@Entity('tag')
export class Tag {
  @PrimaryGeneratedColumn({ name: 'tag_id', type: 'int', unsigned: true })
  tag_id: number;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @OneToMany(() => IdeaTag, (ideaTag) => ideaTag.idea)
  ideaTags: IdeaTag[];
}