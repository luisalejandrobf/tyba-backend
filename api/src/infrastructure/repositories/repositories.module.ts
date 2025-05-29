import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepositoryImpl } from './user.repository.impl';
import { TransactionRepositoryImpl } from './transaction.repository.impl';
import { UserEntity } from '../typeorm/entities/user.entity';
import { TransactionEntity } from '../typeorm/entities/transaction.entity';

/**
 * Repositories module
 * 
 * This module provides the implementations of domain repositories
 * using TypeORM as the underlying persistence mechanism
 */
@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, TransactionEntity])],
  providers: [
    {
      provide: 'UserRepository',
      useClass: UserRepositoryImpl,
    },
    {
      provide: 'TransactionRepository',
      useClass: TransactionRepositoryImpl,
    },
  ],
  exports: ['UserRepository', 'TransactionRepository'],
})
export class RepositoriesModule {} 