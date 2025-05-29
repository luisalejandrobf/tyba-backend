import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../../../domain/entities/user.entity';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { RegisterUserDto } from '../../../interfaces/dtos/user/register-user.dto';
import { LoginUserDto } from '../../../interfaces/dtos/user/login-user.dto';
import { JwtPayloadDto, UserDto } from '../../../interfaces/dtos/user/user.dto';

/**
 * Authentication service
 * 
 * Handles user authentication, registration, and token management
 * following security best practices like password hashing and JWT token generation
 */
@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 10;
  private readonly tokenBlacklist: Set<string> = new Set();

  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Register a new user in the system
   * 
   * @param registerUserDto - User registration data including email and password
   * @returns The created user object without the password hash
   * @throws UnauthorizedException if a user with the email already exists
   */
  async register(registerUserDto: RegisterUserDto): Promise<UserDto> {
    const { email, password } = registerUserDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new UnauthorizedException('User with this email already exists');
    }

    // Hash the password
    const passwordHash = await this.hashPassword(password);

    // Create and save the user
    const user = User.create(email, passwordHash);
    const createdUser = await this.userRepository.createUser(user);

    // Return user without passwordHash
    const { passwordHash: _, ...userWithoutPassword } = createdUser as User;
    return {
      id: createdUser.id,
      email: createdUser.email,
      createdAt: createdUser.createdAt,
      updatedAt: createdUser.updatedAt
    };
  }

  /**
   * Authenticate a user and generate a JWT token
   * 
   * @param loginUserDto - User login credentials with email and password
   * @returns Object containing JWT token and user information (without password)
   * @throws UnauthorizedException if credentials are invalid
   */
  async login(loginUserDto: LoginUserDto): Promise<{ token: string; user: UserDto }> {
    const { email, password } = loginUserDto;

    // Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await this.verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const token = this.generateToken(user);

    // Return token and user without passwordHash
    const userDto: UserDto = {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    return {
      token,
      user: userDto,
    };
  }

  /**
   * Logout a user by adding their token to a blacklist
   * 
   * In a production environment, this should use a persistent store like Redis
   * 
   * @param token - JWT token to invalidate
   */
  logout(token: string): void {
    this.tokenBlacklist.add(token);
  }

  /**
   * Verify if a token is valid (not in blacklist)
   * 
   * @param token - JWT token to verify
   * @returns True if the token is valid, false if blacklisted
   */
  isTokenValid(token: string): boolean {
    return !this.tokenBlacklist.has(token);
  }

  /**
   * Hash a password using bcrypt with configured salt rounds
   * 
   * @param password - Plain text password
   * @returns Hashed password
   */
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Verify a password against a hash using bcrypt
   * 
   * @param password - Plain text password to verify
   * @param hash - Hashed password to compare against
   * @returns True if password matches hash, false otherwise
   */
  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate a JWT token for a user
   * 
   * @param user - User to generate token for
   * @returns Signed JWT token
   */
  private generateToken(user: User): string {
    const payload: JwtPayloadDto = {
      sub: user.id,
      email: user.email,
    };
    return this.jwtService.sign(payload);
  }
} 