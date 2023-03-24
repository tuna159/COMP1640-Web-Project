import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Idea } from './idea.entity';
import { Tag } from './tag.entity';

@Entity('idea_tag')
export class IdeaTag {
  @PrimaryColumn({ name: 'idea_id', type: 'int', unsigned: true })
  idea_id: number;

  @PrimaryColumn({ name: 'tag_id', type: 'int', unsigned: true })
  tag_id: number;

  @ManyToOne(() => Idea, (idea) => idea.ideaTags, { onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'idea_id' })
  idea: Idea;

  @ManyToOne(() => Tag, (tag) => tag.ideaTags, {
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'tag_id' })
  tag: Tag;
}
