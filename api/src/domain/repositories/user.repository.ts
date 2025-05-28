import { User } from '../entities/user.entity';

/**
 * Repository interface for User entities
 * 
 * This interface defines the contract for user persistence operations
 * and serves as a port in the hexagonal architecture
 */
export interface UserRepository {
  /**
   * Creates a new user in the repository
   * 
   * @param user - The user to create
   * @returns The created user
   */
  createUser(user: User): Promise<User>;

  /**
   * Finds a user by their email address
   * 
   * @param email - The email to search for
   * @returns The user if found, null otherwise
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Finds a user by their ID
   * 
   * @param id - The ID to search for
   * @returns The user if found, null otherwise
   */
  findById(id: string): Promise<User | null>;
} 