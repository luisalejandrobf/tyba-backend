import { randomUUID } from 'crypto';

/**
 * User domain entity
 * 
 * This class represents a user in the domain model and
 * encapsulates all business logic related to users
 */
export class User {
  constructor(
    private readonly _id: string,
    private readonly _email: string,
    private readonly _passwordHash: string,
    private readonly _createdAt: Date,
    private readonly _updatedAt: Date,
  ) {}

  // Getters
  /**
   * Get the user's ID
   */
  get id(): string {
    return this._id;
  }

  /**
   * Get the user's email
   */
  get email(): string {
    return this._email;
  }

  /**
   * Get the user's password hash
   */
  get passwordHash(): string {
    return this._passwordHash;
  }

  /**
   * Get the date the user was created
   */
  get createdAt(): Date {
    return this._createdAt;
  }

  /**
   * Get the date the user was last updated
   */
  get updatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * Factory method for creating a new user
   * 
   * @param email - The user's email address
   * @param passwordHash - The hashed password
   * @returns A new User instance
   */
  static create(email: string, passwordHash: string): User {
    const now = new Date();
    return new User(
      randomUUID(), // Generate a UUID for the id
      email,
      passwordHash,
      now,
      now,
    );
  }

  /**
   * Method to create a User instance from existing data
   * 
   * @param id - The user's ID
   * @param email - The user's email address
   * @param passwordHash - The hashed password
   * @param createdAt - The date the user was created
   * @param updatedAt - The date the user was last updated
   * @returns A User instance with the provided data
   */
  static reconstitute(
    id: string,
    email: string,
    passwordHash: string,
    createdAt: Date,
    updatedAt: Date,
  ): User {
    return new User(id, email, passwordHash, createdAt, updatedAt);
  }
} 