import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../../../domain/entities/user.entity';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { RegisterUserDto } from '../../../interfaces/dtos/user/register-user.dto';
import { LoginUserDto } from '../../../interfaces/dtos/user/login-user.dto';

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
   * Register a new user
   * @param registerUserDto User registration data
   * @returns The created user (without password)
   */
  async register(registerUserDto: RegisterUserDto): Promise<Omit<User, 'passwordHash'>> {
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
    const { passwordHash: _, ...userWithoutPassword } = createdUser as any;
    return userWithoutPassword;
  }

  /**
   * Authenticate a user and generate a JWT token
   * @param loginUserDto User login credentials
   * @returns JWT token and user information
   */
  async login(loginUserDto: LoginUserDto): Promise<{ token: string; user: Omit<User, 'passwordHash'> }> {
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
    const { passwordHash: _, ...userWithoutPassword } = user as any;
    return {
      token,
      user: userWithoutPassword,
    };
  }

  /**
   * Logout a user by adding their token to a blacklist
   * Note: In a real application, you might want to use Redis or another cache for the blacklist
   * @param token JWT token
   */
  logout(token: string): void {
    this.tokenBlacklist.add(token);
  }

  /**
   * Verify if a token is valid (not in blacklist)
   * @param token JWT token
   * @returns True if valid, false otherwise
   */
  isTokenValid(token: string): boolean {
    return !this.tokenBlacklist.has(token);
  }

  /**
   * Hash a password using bcrypt
   * @param password Plain text password
   * @returns Hashed password
   */
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Verify a password against a hash
   * @param password Plain text password
   * @param hash Hashed password
   * @returns True if match, false otherwise
   */
  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate a JWT token for a user
   * @param user User to generate token for
   * @returns JWT token
   */
  private generateToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
    };
    return this.jwtService.sign(payload);
  }
} 