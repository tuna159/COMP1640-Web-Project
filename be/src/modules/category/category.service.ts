import { Category } from '@core/database/mysql/entity/category.entity';
import { IUserData } from '@core/interface/default.interface';
import { IdeaService } from '@modules/idea/idea.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EUserRole } from 'enum/default.enum';
import { ErrorMessage } from 'enum/error';
import { CategoryDto } from 'global/dto/category.dto';
import { Repository } from 'typeorm';
import { EntityManager } from 'typeorm/entity-manager/EntityManager';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly ideaService: IdeaService,
  ) {}

  async getAllCategories(entityManager?: EntityManager) {
    const categoryRepository = entityManager
      ? entityManager.getRepository<Category>('category')
      : this.categoryRepository;
    return categoryRepository.find();
  }

  async categoryExists(category_id: number, entityManager?: EntityManager) {
    const categoryRepository = entityManager
      ? entityManager.getRepository<Category>('category')
      : this.categoryRepository;

    return categoryRepository.findOne(category_id);
  }

  getIdeasByCategory(category_id: number) {
    return this.ideaService.getAllIdeas(null, null, category_id);
  }

  async createCategory(userData: IUserData, body: CategoryDto) {
    if (userData.role_id != EUserRole.ADMIN) {
      throw new HttpException(
        ErrorMessage.CATEGORY_PERMISSION,
        HttpStatus.BAD_REQUEST,
      );
    }

    const category = new Category();
    category.name = body.name;
    return this.categoryRepository.save(category);
  }

  async updateCategory(
    category_id: number,
    body: CategoryDto,
    userData: IUserData,
  ) {
    if (userData.role_id != EUserRole.ADMIN) {
      throw new HttpException(
        ErrorMessage.CATEGORY_PERMISSION,
        HttpStatus.BAD_REQUEST,
      );
    }

    const category = await this.categoryExists(category_id);
    if (!category) {
      throw new HttpException(
        ErrorMessage.CATEGORY_NOT_EXISTS,
        HttpStatus.BAD_REQUEST,
      );
    }

    const newCategory = new Category();
    newCategory.name = body.name;
    const result = await this.categoryRepository.update(
      category_id,
      newCategory,
    );
    return {
      affected: result.affected,
    };
  }

  async deleteCategory(
    category_id: number,
    userData: IUserData,
    entityManager?: EntityManager,
  ) {
    const categoryRepository = entityManager
      ? entityManager.getRepository<Category>('category')
      : this.categoryRepository;

    if (userData.role_id != EUserRole.ADMIN) {
      throw new HttpException(
        ErrorMessage.CATEGORY_PERMISSION,
        HttpStatus.BAD_REQUEST,
      );
    }

    const category = await categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.categoryIdeas', 'ideas')
      .where('category.category_id = :category_id', { category_id })
      .getOne();

    if (!category) {
      throw new HttpException(
        ErrorMessage.CATEGORY_NOT_EXISTS,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (category.categoryIdeas.length != 0) {
      throw new HttpException(
        ErrorMessage.CATEGORY_NOT_EMPTY,
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await categoryRepository.delete(category_id);
    return {
      affected: result.affected,
    };
  }
}
