import { Department } from '@core/database/mysql/entity/department.entity';
import { IUserData } from '@core/interface/default.interface';
import { EventService } from '@modules/event/event.service';
import { IdeaService } from '@modules/idea/idea.service';
import { ReactionService } from '@modules/reaction/reaction.service';
import { UserService } from '@modules/user/user.service';
import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EIsDelete } from 'enum';
import { EUserRole } from 'enum/default.enum';
import { ErrorMessage } from 'enum/error';
import { EIdeaFilter } from 'enum/idea.enum';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
} from 'global/dto/department.dto';
import { DeepPartial, EntityManager, IsNull, Repository } from 'typeorm';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @Inject(forwardRef(() => IdeaService))
    private readonly ideaService: IdeaService,
    @Inject(forwardRef(() => EventService))
    private readonly eventService: EventService,

    private reactionService: ReactionService,
  ) {}

  async getAllDepartments(entityManager?: EntityManager) {
    const departmentRepository = entityManager
      ? entityManager.getRepository<Department>('department')
      : this.departmentRepository;

    const departments = await departmentRepository
      .createQueryBuilder('department')
      .innerJoinAndSelect('department.manager', 'manager')
      .innerJoinAndSelect('manager.userDetail', 'userDetail')
      .getMany();

    const data = departments.map((department) => {
      const manager = department.manager.userDetail;
      return {
        department_id: department.department_id,
        name: department.name,
        manager: {
          manager_id: manager.user_id,
          nick_name: manager.nick_name,
          full_name: manager.full_name,
          gender: manager.gender,
          birthday: manager.birthday,
          avatar_url: manager.avatar_url,
        },
      };
    });
    return data;
  }

  async departmentExists(department_id: number, entityManager?: EntityManager) {
    const departmentRepository = entityManager
      ? entityManager.getRepository<Department>('department')
      : this.departmentRepository;

    return departmentRepository.findOne(department_id);
  }

  async containManager(manager_id: string, entityManager?: EntityManager) {
    const departmentRepository = entityManager
      ? entityManager.getRepository<Department>('department')
      : this.departmentRepository;

    return departmentRepository.findOne({ manager_id });
  }

  async getDepartmentDetails(
    department_id: number,
    entityManager?: EntityManager,
  ) {
    const departmentRepository = entityManager
      ? entityManager.getRepository<Department>('department')
      : this.departmentRepository;

    const department = await departmentRepository
      .createQueryBuilder('department')
      .innerJoinAndSelect('department.manager', 'manager')
      .innerJoinAndSelect('manager.userDetail', 'managerDetail')
      .leftJoinAndSelect('department.users', 'users')
      .leftJoinAndSelect('users.userDetail', 'memberDetail')
      .where('department.department_id = :department_id', { department_id })
      .getOne();

    if (!department) {
      throw new HttpException(
        ErrorMessage.DEPARTMENT_NOT_EXISTS,
        HttpStatus.BAD_REQUEST,
      );
    }

    const members = department.users.map((u) => {
      const details = u.userDetail;
      return {
        userId: u.user_id,
        full_name: details.full_name,
        nick_name: details.nick_name,
        gender: details.gender,
        birthday: details.birthday,
        avatar_url: details.avatar_url,
      };
    });

    const manager = department.manager.userDetail;
    return {
      department_id: department.department_id,
      name: department.name,
      manager: {
        manager_id: manager.user_id,
        nick_name: manager.nick_name,
        full_name: manager.full_name,
        gender: manager.gender,
        birthday: manager.birthday,
        avatar_url: manager.avatar_url,
      },
      members,
    };
  }

  async getEventsByDepartment(department_id: number) {
    const department = await this.departmentExists(department_id);
    if (!department) {
      throw new HttpException(
        ErrorMessage.DEPARTMENT_NOT_EXISTS,
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.eventService.getEventsByDepartment(department_id);
  }

  async getEventsByUniversity() {
    return this.eventService.getEventsByUniversity();
  }

  getIdeasByDepartmentAndCategory(
    department_id?: number,
    category_id?: number,
    sorting_setting?: EIdeaFilter,
  ) {
    return this.ideaService.getAllIdeas(
      null,
      department_id,
      category_id,
      sorting_setting,
    );
  }

  async getDepartmentValidIdeas(department_id: number) {
    const department = await this.departmentExists(department_id);
    if (!department) {
      throw new HttpException(
        ErrorMessage.DEPARTMENT_NOT_EXISTS,
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.ideaService.getIdeasOfSystem(
      null,
      null,
      department_id,
      null,
      true,
    );
  }

  async getAvailableDepartments(
    userData: IUserData,
    entityManager?: EntityManager,
  ) {
    const departmentRepository = entityManager
      ? entityManager.getRepository<Department>('department')
      : this.departmentRepository;

    if (userData.role_id != EUserRole.ADMIN) {
      throw new HttpException(
        ErrorMessage.DEPARTMENT_PERMISSION,
        HttpStatus.BAD_REQUEST,
      );
    }

    const departments = await departmentRepository.find({
      manager_id: IsNull(),
    });
    return departments.map((d) => {
      return {
        department_id: d.department_id,
        name: d.name,
      };
    });
  }

  async createDepartment(
    userData: IUserData,
    body: CreateDepartmentDto,
    entityManager?: EntityManager,
  ) {
    const departmentRepository = entityManager
      ? entityManager.getRepository<Department>('department')
      : this.departmentRepository;

    if (userData.role_id != EUserRole.ADMIN) {
      throw new HttpException(
        ErrorMessage.DEPARTMENT_PERMISSION,
        HttpStatus.BAD_REQUEST,
      );
    }
    const department = new Department();
    department.name = body.name;
    return departmentRepository.save(department);
  }

  async updateDepartment(
    userData: IUserData,
    department_id: number,
    body: UpdateDepartmentDto,
    entityManager?: EntityManager,
  ) {
    const departmentRepository = entityManager
      ? entityManager.getRepository<Department>('department')
      : this.departmentRepository;

    if (userData.role_id != EUserRole.ADMIN) {
      throw new HttpException(
        ErrorMessage.DEPARTMENT_PERMISSION,
        HttpStatus.BAD_REQUEST,
      );
    }
    const department = await this.departmentExists(department_id);
    if (!department) {
      throw new HttpException(
        ErrorMessage.DEPARTMENT_NOT_EXISTS,
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await departmentRepository.update(department_id, body);
    return {
      affected: result.affected,
    };
  }

  async deleteDepartment(
    userData: IUserData,
    department_id: number,
    entityManager?: EntityManager,
  ) {
    const departmentRepository = entityManager
      ? entityManager.getRepository<Department>('department')
      : this.departmentRepository;

    if (userData.role_id != EUserRole.ADMIN) {
      throw new HttpException(
        ErrorMessage.DEPARTMENT_PERMISSION,
        HttpStatus.BAD_REQUEST,
      );
    }

    //? Already contains check if department exists
    const department = await this.getDepartmentDetails(department_id);
    if (department.members.length != 0) {
      throw new HttpException(
        ErrorMessage.DEPARTMENT_NOT_EMPTY,
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await departmentRepository.delete(department_id);
    return {
      affected: result.affected,
    };
  }

  async addManagerDeparment(
    user_id: string,
    body: DeepPartial<Department>,
    entityManager?: EntityManager,
  ) {
    const departmentRepository = entityManager
      ? entityManager.getRepository<Department>('department')
      : this.departmentRepository;
    return await departmentRepository.update(user_id, body);
  }

  async getAvailableDepartment(user_id: string, entityManager?: EntityManager) {
    const departmentRepository = entityManager
      ? entityManager.getRepository<Department>('department')
      : this.departmentRepository;

    const departments = await departmentRepository.find({
      manager_id: IsNull(),
    });
    return departments.map((d) => {
      return {
        department_id: d.department_id,
        name: d.name,
      };
    });
  }

  async countTotalStaff(department_id: number, entityManager?: EntityManager) {
    const departmentRepository = entityManager
      ? entityManager.getRepository<Department>('department')
      : this.departmentRepository;

    const result = await departmentRepository
      .createQueryBuilder('department')
      .innerJoin('department.users', 'users')
      .where('users.department_id = :department_id', { department_id })
      .andWhere('users.is_deleted = :is_deleted', {
        is_deleted: EIsDelete.NOT_DELETED,
      })
      .getRawMany();
    return result.length;
  }

  async getDepartmentStaffContribution(
    department_id: number,
    userData: IUserData,
    entityManager?: EntityManager,
  ) {
    if (userData.role_id != EUserRole.ADMIN) {
      throw new HttpException(
        ErrorMessage.GENERAL_PERMISSION,
        HttpStatus.BAD_REQUEST,
      );
    }
    const department = await this.departmentExists(department_id);
    if (!department) {
      throw new HttpException(
        ErrorMessage.DEPARTMENT_NOT_EXISTS,
        HttpStatus.BAD_REQUEST,
      );
    }
    const staffContributed =
      await this.ideaService.getDepartmentStaffContribution(
        department_id,
        entityManager,
      );
    const total = await this.countTotalStaff(department_id, entityManager);
    return {
      department_id: department.department_id,
      name: department.name,
      total_staff: total,
      staff_contributed: staffContributed,
    };
  }

  async getDepartmentStaffReaction(
    department_id: number,
    userData: IUserData,
    entityManager?: EntityManager,
  ) {
    if (userData.role_id != EUserRole.ADMIN) {
      throw new HttpException(
        ErrorMessage.GENERAL_PERMISSION,
        HttpStatus.BAD_REQUEST,
      );
    }
    const department = await this.departmentExists(department_id);
    if (!department) {
      throw new HttpException(
        ErrorMessage.DEPARTMENT_NOT_EXISTS,
        HttpStatus.BAD_REQUEST,
      );
    }

    const totalReactionLikeByDepartment =
      await this.reactionService.getListReactionLikeByDepartment(department_id);
    const totalReactionDislikeByDepartment =
      await this.reactionService.getListReactionDisLikeByDepartment(
        department_id,
      );

    return {
      total_like: totalReactionLikeByDepartment,
      total_dislike: totalReactionDislikeByDepartment,
    };
  }
}
