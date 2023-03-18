import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CategoryIdea } from './categoryIdea.entity';

@Entity('category')
export class Category {
  @PrimaryGeneratedColumn({ name: 'category_id', type: 'int', unsigned: true })
  category_id: number;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @OneToMany(() => CategoryIdea, (categoryIdea) => categoryIdea.category)
  categoryIdeas: CategoryIdea[];
}
