import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepositoryImpl } from './user.repository.impl';
import { UserEntity } from '../typeorm/entities/user.entity';

/**
 * Repositories module
 * 
 * This module provides the implementations of domain repositories
 * using TypeORM as the underlying persistence mechanism
 */
@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [
    {
      provide: 'UserRepository',
      useClass: UserRepositoryImpl,
    },
  ],
  exports: ['UserRepository'],
})
export class RepositoriesModule {} 