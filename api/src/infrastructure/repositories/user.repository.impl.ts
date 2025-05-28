import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRepository } from '../../domain/repositories/user.repository';
import { User } from '../../domain/entities/user.entity';
import { UserEntity } from '../typeorm/entities/user.entity';

/**
 * Implementation of the UserRepository interface using TypeORM
 * 
 * This class acts as an adapter between the domain and the database
 */
@Injectable()
export class UserRepositoryImpl implements UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  /**
   * Creates a new user in the database
   * 
   * @param user - The domain user entity to persist
   * @returns The created user as a domain entity
   */
  async createUser(user: User): Promise<User> {
    const userEntity = this.userRepository.create({
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });

    const savedUser = await this.userRepository.save(userEntity);

    return User.reconstitute(
      savedUser.id,
      savedUser.email,
      savedUser.passwordHash,
      savedUser.createdAt,
      savedUser.updatedAt,
    );
  }

  /**
   * Finds a user by their email address
   * 
   * @param email - The email to search for
   * @returns The user as a domain entity or null if not found
   */
  async findByEmail(email: string): Promise<User | null> {
    const userEntity = await this.userRepository.findOne({
      where: { email },
    });

    if (!userEntity) {
      return null;
    }

    return User.reconstitute(
      userEntity.id,
      userEntity.email,
      userEntity.passwordHash,
      userEntity.createdAt,
      userEntity.updatedAt,
    );
  }

  /**
   * Finds a user by their ID
   * 
   * @param id - The ID to search for
   * @returns The user as a domain entity or null if not found
   */
  async findById(id: string): Promise<User | null> {
    const userEntity = await this.userRepository.findOne({
      where: { id },
    });

    if (!userEntity) {
      return null;
    }

    return User.reconstitute(
      userEntity.id,
      userEntity.email,
      userEntity.passwordHash,
      userEntity.createdAt,
      userEntity.updatedAt,
    );
  }
} 