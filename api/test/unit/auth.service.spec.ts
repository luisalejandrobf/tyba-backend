import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/application/services/auth/auth.service';
import { UserRepository } from '../../src/domain/repositories/user.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../../src/domain/entities/user.entity';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../../src/app.module';
import { UserDto } from '../../src/interfaces/dtos/user/user.dto';

// Tests the auth service for unit
describe('AuthService', () => {
  let service: AuthService;
  let userRepository: UserRepository;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<UserRepository>('UserRepository');
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Tests user registration functionality, validating successful creation
  // and proper handling of duplicate user scenarios
  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerUserDto = { 
        email: `test-${Date.now()}@example.com`, 
        password: 'Password123!', 
        passwordConfirmation: 'Password123!' 
      };

      const result = await service.register(registerUserDto);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      
      // Verify the properties according to the UserDto structure
      expect(result.id).toBeDefined();
      expect(result.email).toBe(registerUserDto.email);
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it('should throw UnauthorizedException if user already exists', async () => {
      const email = `test-duplicate-${Date.now()}@example.com`;
      const registerUserDto = { 
        email, 
        password: 'Password123!', 
        passwordConfirmation: 'Password123!' 
      };

      // Register first time
      await service.register(registerUserDto);

      // Try to register again with same email
      await expect(service.register(registerUserDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  // Tests user authentication functionality, validating successful login
  // and proper error handling for invalid credentials
  describe('login', () => {
    it('should login an existing user successfully', async () => {
      // First register a user
      const email = `test-login-${Date.now()}@example.com`;
      const password = 'Password123!';
      const registerUserDto = { 
        email, 
        password, 
        passwordConfirmation: password 
      };
      
      await service.register(registerUserDto);

      // Then try to login
      const loginUserDto = { email, password };
      const result = await service.login(loginUserDto);
      
      expect(result).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.user).toBeDefined();
      
      // Verify the specific properties of the user
      expect(result.user.id).toBeDefined();
      expect(result.user.email).toBe(email);
      expect(result.user.createdAt).toBeDefined();
      expect(result.user.updatedAt).toBeDefined();
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const loginUserDto = { 
        email: 'nonexistent@example.com', 
        password: 'Password123!' 
      };

      await expect(service.login(loginUserDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      // First register a user
      const email = `test-wrong-pass-${Date.now()}@example.com`;
      const password = 'Password123!';
      const registerUserDto = { 
        email, 
        password, 
        passwordConfirmation: password 
      };
      
      await service.register(registerUserDto);

      // Then try to login with wrong password
      const loginUserDto = { email, password: 'WrongPassword123!' };
      
      await expect(service.login(loginUserDto)).rejects.toThrow(UnauthorizedException);
    });
  });
}); 