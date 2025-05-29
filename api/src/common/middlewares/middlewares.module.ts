import { Module } from '@nestjs/common';
import { TransactionLoggerMiddleware } from './transaction-logger.middleware';
import { TransactionModule } from '../../application/services/transaction/transaction.module';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from '../../application/services/auth/auth.module';

/**
 * Middlewares module
 * 
 * This module provides middleware components for the application
 */
@Module({
  imports: [
    TransactionModule,
    HttpModule.register({}),
    AuthModule,
  ],
  providers: [TransactionLoggerMiddleware],
  exports: [TransactionLoggerMiddleware, HttpModule],
})
export class MiddlewaresModule {} 