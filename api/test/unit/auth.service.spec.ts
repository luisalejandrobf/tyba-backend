import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/application/services/auth/auth.service';
import { UserRepository } from '../../src/domain/repositories/user.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../../src/domain/entities/user.entity';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// Mock UserRepository
const mockUserRepository = {
  findByEmail: jest.fn(),
  createUser: jest.fn(),
  findById: jest.fn(),
};

// Mock JwtService
const mockJwtService = {
  sign: jest.fn(),
};

// Mock ConfigService
const mockConfigService = {
  get: jest.fn((key: string) => {
    if (key === 'jwt.secret') return 'test-secret';
    if (key === 'jwt.expiresIn') return '1h';
    return null;
  }),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: 'UserRepository', useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Test for register method
  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerUserDto = { email: 'test@example.com', password: 'password123', passwordConfirmation: 'password123' };
      const hashedPassword = 'hashedPassword';
      const user = User.create(registerUserDto.email, hashedPassword);

      mockUserRepository.findByEmail.mockResolvedValue(null);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);
      mockUserRepository.createUser.mockResolvedValue(user);

      const result = await service.register(registerUserDto);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...expectedUser } = user;


      expect(result).toEqual(expectedUser);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(registerUserDto.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(registerUserDto.password, 10);
      expect(mockUserRepository.createUser).toHaveBeenCalledWith(expect.any(User));
    });

    it('should throw UnauthorizedException if user already exists', async () => {
      const registerUserDto = { email: 'test@example.com', password: 'password123', passwordConfirmation: 'password123' };
      mockUserRepository.findByEmail.mockResolvedValue({});

      await expect(service.register(registerUserDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  // Test for login method
  describe('login', () => {
    it('should login an existing user successfully', async () => {
      const loginUserDto = { email: 'test@example.com', password: 'password123' };
      const hashedPassword = 'hashedPassword';
      const user = User.create(loginUserDto.email, hashedPassword);
      const token = 'jwtToken';

      mockUserRepository.findByEmail.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      mockJwtService.sign.mockReturnValue(token);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...userWithoutPassword } = user;


      const result = await service.login(loginUserDto);

      expect(result).toEqual({ token, user: userWithoutPassword });
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(loginUserDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginUserDto.password, hashedPassword);
      expect(mockJwtService.sign).toHaveBeenCalledWith({ sub: user.id, email: user.email });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const loginUserDto = { email: 'test@example.com', password: 'password123' };
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginUserDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      const loginUserDto = { email: 'test@example.com', password: 'password123' };
      const hashedPassword = 'hashedPassword';
      const user = User.create(loginUserDto.email, hashedPassword);
      
      mockUserRepository.findByEmail.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(service.login(loginUserDto)).rejects.toThrow(UnauthorizedException);
    });
  });
}); 