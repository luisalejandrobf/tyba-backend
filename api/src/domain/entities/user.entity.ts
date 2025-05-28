import { randomUUID } from 'crypto';

export class User {
  constructor(
    private readonly _id: string,
    private readonly _email: string,
    private readonly _passwordHash: string,
    private readonly _createdAt: Date,
    private readonly _updatedAt: Date,
  ) {}

  // Getters
  get id(): string {
    return this._id;
  }

  get email(): string {
    return this._email;
  }

  get passwordHash(): string {
    return this._passwordHash;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // Factory method for creating a new user
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

  // Method to create a User instance from existing data
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