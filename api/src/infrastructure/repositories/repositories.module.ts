import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UserRepositoryImpl } from './user.repository.impl';
import { UserRepository } from '../../domain/repositories/user.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: 'UserRepository',
      useClass: UserRepositoryImpl,
    },
  ],
  exports: ['UserRepository'],
})
export class RepositoriesModule {} 