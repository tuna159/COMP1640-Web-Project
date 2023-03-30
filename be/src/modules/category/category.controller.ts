import { UserData } from '@core/decorator/user.decorator';
import { IUserData } from '@core/interface/default.interface';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CategoryDto } from 'global/dto/category.dto';
import { CategoryService } from './category.service';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  getAllCategories() {
    return this.categoryService.getAllCategories();
  }

  @Get(':category_id/ideas')
  getIdeasByCategory(@Param('category_id') category_id: number) {
    return this.categoryService.getIdeasByCategory(category_id);
  }

  @Post()
  createCategory(@UserData() userData: IUserData, @Body() body: CategoryDto) {
    return this.categoryService.createCategory(userData, body);
  }

  @Put(':category_id')
  updateCategory(
    @Param('category_id') category_id: number,
    @Body() body: CategoryDto,
    @UserData() userData: IUserData,
  ) {
    return this.categoryService.updateCategory(category_id, body, userData);
  }

  @Delete(':category_id')
  deleteCategory(
    @Param('category_id') category_id: number,
    @UserData() userData: IUserData,
  ) {
    return this.categoryService.deleteCategory(category_id, userData);
  }
}
