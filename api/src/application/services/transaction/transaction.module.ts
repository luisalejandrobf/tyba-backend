import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { RepositoriesModule } from '../../../infrastructure/repositories/repositories.module';

/**
 * Transaction module
 * 
 * This module provides the transaction service and required dependencies
 */
@Module({
  imports: [RepositoriesModule],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class TransactionModule {} 