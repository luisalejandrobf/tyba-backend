import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserEntity } from './entities/user.entity';
import { TransactionEntity } from './entities/transaction.entity';
import { join } from 'path';

/**
 * TypeORM configuration module
 * 
 * This module configures the TypeORM connection to the PostgreSQL database
 * and automatically creates tables if they don't exist via synchronize option. This is really helpful for the first time setup.
 */
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const sslMode = configService.get<string>('database.sslMode');
        const sslConfig = sslMode === 'require' 
          ? { rejectUnauthorized: false } 
          : false;
          
        return {
          type: 'postgres',
          host: configService.get<string>('database.host'),
          port: configService.get<number>('database.port'),
          username: configService.get<string>('database.user'),
          password: configService.get<string>('database.password'),
          database: configService.get<string>('database.name'),
          entities: [UserEntity, TransactionEntity],
          synchronize: true, // Automatically creates tables if they don't exist
          ssl: sslConfig,
          migrations: [join(__dirname, '../../migration/*{.ts,.js}')],
          migrationsRun: true, // Automatically run migrations on startup
          logging: ['error', 'warn', 'migration'],
        };
      },
    }),
  ],
})
export class TypeOrmConfigModule {} 