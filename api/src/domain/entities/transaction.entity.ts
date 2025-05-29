import { randomUUID } from 'crypto';

/**
 * Transaction types enum
 */
export enum TransactionType {
  AUTH = 'AUTH',
  SEARCH = 'SEARCH',
  TRANSACTION = 'TRANSACTION'
}

/**
 * Transaction domain entity
 * 
 * This class represents a transaction in the domain model
 * to track user activities in the system
 */
export class Transaction {
  constructor(
    private readonly _id: string,
    private readonly _userId: string,
    private readonly _type: TransactionType,
    private readonly _endpoint: string,
    private readonly _params: string,
    private readonly _description: string,
    private readonly _createdAt: Date,
  ) {}

  // Getters
  /**
   * Get the transaction's ID
   */
  get id(): string {
    return this._id;
  }

  /**
   * Get the user ID associated with this transaction
   */
  get userId(): string {
    return this._userId;
  }

  /**
   * Get the transaction type
   */
  get type(): TransactionType {
    return this._type;
  }

  /**
   * Get the endpoint accessed in this transaction
   */
  get endpoint(): string {
    return this._endpoint;
  }

  /**
   * Get the parameters used in this transaction
   */
  get params(): string {
    return this._params;
  }

  /**
   * Get the transaction description
   */
  get description(): string {
    return this._description;
  }

  /**
   * Get the date the transaction was created
   */
  get createdAt(): Date {
    return this._createdAt;
  }

  /**
   * Factory method for creating a new transaction
   * 
   * @param userId - The user's ID
   * @param type - Type of transaction
   * @param endpoint - The API endpoint accessed
   * @param params - The parameters used in the request
   * @param description - Description of the transaction
   * @returns A new Transaction instance
   */
  static create(
    userId: string,
    type: TransactionType,
    endpoint: string,
    params: string,
    description: string,
  ): Transaction {
    return new Transaction(
      randomUUID(),
      userId,
      type,
      endpoint,
      params,
      description,
      new Date(),
    );
  }

  /**
   * Method to create a Transaction instance from existing data
   */
  static reconstitute(
    id: string,
    userId: string,
    type: TransactionType,
    endpoint: string,
    params: string,
    description: string,
    createdAt: Date,
  ): Transaction {
    return new Transaction(
      id,
      userId,
      type,
      endpoint,
      params,
      description,
      createdAt,
    );
  }
} 