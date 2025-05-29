import { Injectable, Inject } from '@nestjs/common';
import { TransactionRepository } from '../../../domain/repositories/transaction.repository';
import { Transaction, TransactionType } from '../../../domain/entities/transaction.entity';

/**
 * Transaction service
 * 
 * Handles business logic related to transaction operations
 */
@Injectable()
export class TransactionService {
  constructor(
    @Inject('TransactionRepository')
    private readonly transactionRepository: TransactionRepository,
  ) {}

  /**
   * Get all transactions for a specific user
   * 
   * @param userId - The user ID to get transactions for
   * @returns Array of transactions for the user
   */
  async getUserTransactions(userId: string): Promise<Transaction[]> {
    return this.transactionRepository.findByUserId(userId);
  }

  /**
   * Create a new transaction record
   * 
   * @param userId - The user ID associated with the transaction
   * @param type - The type of transaction
   * @param endpoint - The API endpoint that was accessed
   * @param params - The parameters used in the request (as a string)
   * @param description - A description of the transaction
   * @returns The created transaction
   */
  async createTransaction(
    userId: string,
    type: TransactionType,
    endpoint: string,
    params: string,
    description: string,
  ): Promise<Transaction> {
    const transaction = Transaction.create(
      userId,
      type,
      endpoint,
      params,
      description,
    );
    
    return this.transactionRepository.createTransaction(transaction);
  }
} 