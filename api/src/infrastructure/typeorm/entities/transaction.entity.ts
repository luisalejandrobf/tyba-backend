import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';
import { TransactionType } from '../../../domain/entities/transaction.entity';

/**
 * Transaction TypeORM entity
 * 
 * This class represents a transaction in the database
 */
@Entity('transactions')
export class TransactionEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  userId: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: TransactionType.TRANSACTION
  })
  type: string; // Store as string to avoid enum issues

  @Column()
  endpoint: string;

  @Column({ type: 'text' })
  params: string;

  @Column()
  description: string;

  @CreateDateColumn()
  createdAt: Date;
} 