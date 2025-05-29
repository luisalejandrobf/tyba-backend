import { Transaction } from '../entities/transaction.entity';

/**
 * Repository interface for Transaction entities
 * 
 * This interface defines the contract for transaction persistence operations
 * and serves as a port in the hexagonal architecture
 */
export interface TransactionRepository {
  /**
   * Creates a new transaction in the repository
   * 
   * @param transaction - The transaction to create
   * @returns The created transaction
   */
  createTransaction(transaction: Transaction): Promise<Transaction>;

  /**
   * Finds transactions by user ID
   * 
   * @param userId - The user ID to search for
   * @returns Array of transactions for the specified user
   */
  findByUserId(userId: string): Promise<Transaction[]>;
} 