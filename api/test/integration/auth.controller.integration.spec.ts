import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import { ValidationPipe } from '../../src/common/pipes/validation.pipe';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module'; // Adjust if your AppModule is elsewhere
import { UserRepository } from '../../src/domain/repositories/user.repository';
import { User } from '../../src/domain/entities/user.entity';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';

// Helper to create a mock user directly in the repository for testing login
async function createMockUser(userRepository: UserRepository, email: string, passwordP: string): Promise<User> {
  const passwordHash = await bcrypt.hash(passwordP, 10);
  const user = User.create(email, passwordHash);
  return userRepository.createUser(user);
}

describe('AuthController (Integration)', () => {
  let app: INestApplication;
  let userRepository: UserRepository;
  let createdUser: User; // To store user created during tests for cleanup or login

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(ValidationPipe); // Use the custom ValidationPipe
    await app.init();

    userRepository = moduleFixture.get<UserRepository>('UserRepository');
  });

  afterAll(async () => {

    if (createdUser && userRepository && typeof (userRepository as any).deleteUserByEmail === 'function') {
        // Placeholder for actual deletion logic, IF NEEDED
        // await (userRepository as any).deleteUserByEmail(createdUser.email);
    }
    await app.close();
  });

  // Clear user table before each test or ensure unique emails
  beforeEach(async () => {
    // It's often better to ensure unique data for each test or clean the DB.
    // For simplicity, we'll use unique emails per test run where needed.
    // Or, if the repository has a deleteAll method
    // await (userRepository as any).clearAllUsers?.(); 
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user successfully', async () => {
      const uniqueEmail = `test-${randomUUID()}@example.com`;
      const registerDto = { email: uniqueEmail, password: 'Password123!', passwordConfirmation: 'Password123!' };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(HttpStatus.CREATED)
        .then((response) => {
          expect(response.body.success).toBe(true);
          expect(response.body.message).toEqual('User registered successfully');
          expect(response.body.data).toBeDefined();
          // Store email for later comparison
          createdUser = {
            email: uniqueEmail
          } as User;
        });
    });

    it('should fail if passwords do not match', () => {
        const uniqueEmail = `test-${randomUUID()}@example.com`;
        const registerDto = { email: uniqueEmail, password: 'Password123!', passwordConfirmation: 'WrongPassword!' };
  
        return request(app.getHttpServer())
          .post('/auth/register')
          .send(registerDto)
          .expect(HttpStatus.BAD_REQUEST) // Assuming DTO validation catches this
          .then((response) => {
            // Don't check for success field since it's not included in error responses
            // The error message is returned as an array
            expect(Array.isArray(response.body.message)).toBe(true);
            expect(response.body.message[0]).toBe('Passwords do not match');
          });
      });

    it('should fail if user already exists', async () => {
      const uniqueEmail = `test-${randomUUID()}@example.com`;
      const registerDto = { email: uniqueEmail, password: 'Password123!', passwordConfirmation: 'Password123!' };

      // First registration
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(HttpStatus.CREATED);

      // Attempt to register again with the same email
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(HttpStatus.UNAUTHORIZED) // As per AuthService logic
        .then((response) => {
            // Don't check for success field since it's not included in error responses
            expect(response.body.message).toEqual('User with this email already exists');
        });
    });
  });

  describe('/auth/login (POST)', () => {
    const loginEmail = `login-${randomUUID()}@example.com`;
    const loginPassword = 'Password123!';

    beforeAll(async () => {
      // Create a user to test login
      // Ensure this user is created *before* the login tests run
      const userToLogin = await createMockUser(userRepository, loginEmail, loginPassword);
      createdUser = User.reconstitute(userToLogin.id, userToLogin.email, userToLogin.passwordHash, userToLogin.createdAt, userToLogin.updatedAt);      
    });

    it('should login an existing user successfully and return a JWT token', async () => {
      const loginDto = { email: loginEmail, password: loginPassword };

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(HttpStatus.OK)
        .then((response) => {
          expect(response.body.success).toBe(true);
          expect(response.body.message).toEqual('Login successful');
          expect(response.body.data.token).toBeDefined();
          // Check that we get back user data - the structure may vary
          expect(response.body.data).toBeDefined();
        });
    });

    it('should fail with invalid credentials for non-existent user', () => {
      const loginDto = { email: 'nonexistent@example.com', password: 'somepassword' };

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(HttpStatus.UNAUTHORIZED)
        .then((response) => {
            // Don't check for success field since it's not included in error responses
            expect(response.body.message).toEqual('Invalid credentials');
        });
    });

    it('should fail with invalid credentials for wrong password', async () => {
        const loginDto = { email: loginEmail, password: 'WrongPassword!' };
  
        return request(app.getHttpServer())
          .post('/auth/login')
          .send(loginDto)
          .expect(HttpStatus.UNAUTHORIZED)
          .then((response) => {
              // Don't check for success field since it's not included in error responses
              expect(response.body.message).toEqual('Invalid credentials');
          });
      });
  });

  describe('/auth/profile (GET)', () => {
    let authToken: string;
    const profileEmail = `profile-${randomUUID()}@example.com`;
    const profilePassword = 'Password123!';
    let profileUser: User;

    beforeAll(async () => {
      // Create and login user to get token
      profileUser = await createMockUser(userRepository, profileEmail, profilePassword);
      
      const loginDto = { email: profileEmail, password: profilePassword };
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(HttpStatus.OK);
      authToken = response.body.data.token;
    });

    it('should get user profile with valid token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.OK)
        .then((response) => {
          expect(response.body.success).toBe(true);
          expect(response.body.data.id).toEqual(profileUser.id);
          expect(response.body.data.email).toEqual(profileEmail);
        });
    });

    it('should fail to get profile without token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should fail to get profile with invalid token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalidsillytoken')
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

}); 