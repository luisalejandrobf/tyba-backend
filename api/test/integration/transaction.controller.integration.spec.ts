import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { TransactionRepository } from '../../src/domain/repositories/transaction.repository';
import { Transaction, TransactionType } from '../../src/domain/entities/transaction.entity';
import { UserRepository } from '../../src/domain/repositories/user.repository';
import { User } from '../../src/domain/entities/user.entity';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';

// Helper to create and login a user, returns a token and user ID
async function setupUserAndGetToken(app: INestApplication, userRepository: UserRepository): Promise<{ token: string, userId: string }> {
    const email = `transaction-test-${randomUUID()}@example.com`;
    const password = 'Password123!';
    const passwordHash = await bcrypt.hash(password, 10);
    const user = User.create(email, passwordHash);
    const createdUser = await userRepository.createUser(user);

    const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password })
        .expect(HttpStatus.OK);
    return { token: loginResponse.body.data.token, userId: createdUser.id };
}

// Mock TransactionRepository
const mockTransactionRepository = {
    createTransaction: jest.fn(),
    findByUserId: jest.fn(),
  };

describe('TransactionController (Integration)', () => {
  let app: INestApplication;
  let authToken: string;
  let authUserId: string;
  let userRepository: UserRepository;
  let transactionRepository: TransactionRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider('TransactionRepository') // Override the actual repository
    .useValue(mockTransactionRepository)      // With our mock
    .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    userRepository = moduleFixture.get<UserRepository>('UserRepository');
    transactionRepository = moduleFixture.get<TransactionRepository>('TransactionRepository');
    const setup = await setupUserAndGetToken(app, userRepository);
    authToken = setup.token;
    authUserId = setup.userId;
  });

  beforeEach(() => {
    // Clear all mock calls and reset implementation if needed before each test
    mockTransactionRepository.findByUserId.mockClear();
    mockTransactionRepository.createTransaction.mockClear();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/transactions (GET)', () => {
    it('should get transactions for the authenticated user', async () => {
      const mockUserTransactions = [
        Transaction.create(authUserId, TransactionType.SEARCH, '/restaurants', '{"lat":10,"lon":10}', 'Search restaurants'),
        Transaction.create(authUserId, TransactionType.AUTH, '/auth/profile', '{}', 'View profile'),
      ];
      // Ensure the mock is configured *before* the request is made
      mockTransactionRepository.findByUserId.mockResolvedValue(mockUserTransactions);

      return request(app.getHttpServer())
        .get('/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.OK)
        .then((response) => {
          expect(response.body.success).toBe(true);
          expect(response.body.message).toEqual('Transactions retrieved successfully');
          expect(response.body.data).toBeInstanceOf(Array);
          expect(response.body.data.length).toEqual(mockUserTransactions.length);
          expect(response.body.data[0].userId).toEqual(authUserId);
          expect(response.body.data[0].type).toEqual(TransactionType.SEARCH);
          expect(response.body.data[1].description).toEqual('View profile');
          // Check that the repository method was called with the correct user ID
          expect(mockTransactionRepository.findByUserId).toHaveBeenCalledWith(authUserId);
        });
    });

    it('should return an empty array if the user has no transactions', async () => {
        mockTransactionRepository.findByUserId.mockResolvedValue([]); // Simulate no transactions
  
        return request(app.getHttpServer())
          .get('/transactions')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(HttpStatus.OK)
          .then((response) => {
            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual([]);
            expect(mockTransactionRepository.findByUserId).toHaveBeenCalledWith(authUserId);
          });
      });

    it('should return 401 Unauthorized if no token is provided', () => {
      return request(app.getHttpServer())
        .get('/transactions')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    // Example of how a transaction might be created by another action (e.g., searching restaurants)
    // This is more of an end-to-end style test for the transaction logging itself.
    // For a focused integration test of TransactionController, the above are more direct.
    it('should have a transaction logged after a restaurant search (demonstrates transaction creation)', async () => {
        // For this test, we need the *actual* TransactionService and its repository interaction
        // This means we might not want to mock TransactionRepository globally if testing this behavior,
        // or we provide a more specific mock for createTransaction.
        
        // Reset findByUserId for this specific test, as it will be called by /transactions
        const initialTransactions = [
            Transaction.create(authUserId, TransactionType.AUTH, '/auth/login', '{}', 'User login')
        ];
        mockTransactionRepository.findByUserId.mockResolvedValue(initialTransactions);
        
        // Mock createTransaction to capture its call
        const createdTransactionPromise = new Promise<Transaction>(resolve => {
            mockTransactionRepository.createTransaction.mockImplementationOnce(async (transaction: Transaction) => {
                resolve(transaction);
                return transaction; 
            });
        });

        // Perform an action that should create a transaction (e.g., search restaurants)
        await request(app.getHttpServer())
            .get('/restaurants?lat=10&lon=20') // Assuming this endpoint logs a transaction
            .set('Authorization', `Bearer ${authToken}`)
            .expect(HttpStatus.OK);

        // Wait for the transaction to be "created" (i.e., mock called)
        const loggedTransaction = await createdTransactionPromise;
        expect(loggedTransaction).toBeDefined();
        expect(loggedTransaction.userId).toEqual(authUserId);
        expect(loggedTransaction.type).toEqual(TransactionType.SEARCH);
        // The actual endpoint includes query parameters, so we should check it contains the base path
        expect(loggedTransaction.endpoint).toContain('/restaurants');
        // The actual description format is more specific
        expect(loggedTransaction.description).toContain('Searched for restaurants near coordinates');

        // Now, if we fetch transactions, we should see the new one (if the mock is updated)
        const updatedTransactions = [...initialTransactions, loggedTransaction];
        mockTransactionRepository.findByUserId.mockResolvedValue(updatedTransactions);

        return request(app.getHttpServer())
            .get('/transactions')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(HttpStatus.OK)
            .then(response => {
                expect(response.body.data.length).toEqual(updatedTransactions.length);
                expect(response.body.data.some(t => t.id === loggedTransaction.id)).toBe(true);
            });
      });
  });
}); 