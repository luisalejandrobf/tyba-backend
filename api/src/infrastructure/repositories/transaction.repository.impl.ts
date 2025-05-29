import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionRepository } from '../../domain/repositories/transaction.repository';
import { Transaction, TransactionType } from '../../domain/entities/transaction.entity';
import { TransactionEntity } from '../typeorm/entities/transaction.entity';

/**
 * Implementation of TransactionRepository using TypeORM
 */
@Injectable()
export class TransactionRepositoryImpl implements TransactionRepository {
  private readonly logger = new Logger(TransactionRepositoryImpl.name);

  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionEntityRepository: Repository<TransactionEntity>,
  ) {}

  /**
   * Creates a new transaction in the database
   * 
   * @param transaction - The transaction domain entity to create
   * @returns The created transaction domain entity
   */
  async createTransaction(transaction: Transaction): Promise<Transaction> {
    try {
      // Map domain entity to ORM entity
      const transactionEntity = this.mapToEntity(transaction);
      
      this.logger.debug(`Saving transaction: id=${transaction.id}, type=${transaction.type}, endpoint=${transaction.endpoint}`);
      
      // Save to database
      const savedEntity = await this.transactionEntityRepository.save(transactionEntity);
      
      // Map back to domain entity
      return this.mapToDomain(savedEntity);
    } catch (error) {
      this.logger.error(`Error saving transaction: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Finds all transactions for a specific user
   * 
   * @param userId - The user ID to search for
   * @returns Array of transaction domain entities
   */
  async findByUserId(userId: string): Promise<Transaction[]> {
    try {
      // Find all transactions for the user, ordered by creation date (newest first)
      const entities = await this.transactionEntityRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
      });
      
      this.logger.debug(`Found ${entities.length} transactions for user ${userId}`);
      
      // Map each entity to a domain entity
      return entities.map(entity => this.mapToDomain(entity));
    } catch (error) {
      this.logger.error(`Error finding transactions: ${error.message}`, error.stack);
      return [];
    }
  }

  /**
   * Maps a domain entity to a TypeORM entity
   * 
   * @param transaction - The transaction domain entity
   * @returns A transaction TypeORM entity
   */
  private mapToEntity(transaction: Transaction): TransactionEntity {
    const entity = new TransactionEntity();
    entity.id = transaction.id;
    entity.userId = transaction.userId;
    entity.type = transaction.type.toString(); // Convert enum to string
    entity.endpoint = transaction.endpoint;
    entity.params = transaction.params;
    entity.description = transaction.description;
    entity.createdAt = transaction.createdAt;
    return entity;
  }

  /**
   * Maps a TypeORM entity to a domain entity
   * 
   * @param entity - The transaction TypeORM entity
   * @returns A transaction domain entity
   */
  private mapToDomain(entity: TransactionEntity): Transaction {
    // Convert string type back to enum
    const type = entity.type as TransactionType;
    
    return Transaction.reconstitute(
      entity.id,
      entity.userId,
      type,
      entity.endpoint,
      entity.params,
      entity.description,
      entity.createdAt,
    );
  }
} 