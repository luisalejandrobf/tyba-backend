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

// Tests the transaction controller for integration
describe('TransactionController (Integration)', () => {
  let app: INestApplication;
  let authToken: string;
  let authUserId: string;
  let userRepository: UserRepository;
  let transactionRepository: TransactionRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    userRepository = moduleFixture.get<UserRepository>('UserRepository');
    transactionRepository = moduleFixture.get<TransactionRepository>('TransactionRepository');
    const setup = await setupUserAndGetToken(app, userRepository);
    authToken = setup.token;
    authUserId = setup.userId;
  });

  afterAll(async () => {
    await app.close();
  });

  // Tests transaction retrieval functionality and validates the 
  // automatic creation of transaction records after API interactions
  describe('/transactions (GET)', () => {
    it('should get transactions for the authenticated user', async () => {
      // Primero realizamos una acción que genere una transacción
      await request(app.getHttpServer())
        .get('/restaurants?lat=10&lon=20')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.OK);

      // Luego verificamos que la transacción se haya registrado
      return request(app.getHttpServer())
        .get('/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.OK)
        .then((response) => {
          expect(response.body.success).toBe(true);
          expect(response.body.message).toEqual('Transactions retrieved successfully');
          expect(response.body.data).toBeInstanceOf(Array);
          expect(response.body.data.length).toBeGreaterThan(0);
          
          // Verificamos que al menos una transacción pertenezca al usuario autenticado
          const userTransactions = response.body.data.filter(t => t.userId === authUserId);
          expect(userTransactions.length).toBeGreaterThan(0);
          
          // Verificamos que exista al menos una transacción de tipo SEARCH
          const searchTransaction = response.body.data.find(t => t.type === TransactionType.SEARCH);
          expect(searchTransaction).toBeDefined();
        });
    });

    it('should return 401 Unauthorized if no token is provided', () => {
      return request(app.getHttpServer())
        .get('/transactions')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    // Test que verifica la creación de transacciones después de una acción
    it('should have a transaction logged after a restaurant search', async () => {
      // Obtenemos las transacciones actuales
      const initialResponse = await request(app.getHttpServer())
        .get('/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.OK);
      
      const initialCount = initialResponse.body.data.length;

      // Realizamos una búsqueda que debería generar una transacción
      await request(app.getHttpServer())
        .get('/restaurants?lat=40.7128&lon=-74.0060')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.OK);

      // Verificamos que se haya creado una nueva transacción
      const updatedResponse = await request(app.getHttpServer())
        .get('/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.OK);

      expect(updatedResponse.body.data.length).toBeGreaterThan(initialCount);
      
      // Verificamos que la nueva transacción sea de tipo SEARCH y contenga la información correcta
      const newTransactions = updatedResponse.body.data.slice(0, updatedResponse.body.data.length - initialCount);
      const searchTransaction = newTransactions.find(t => t.type === TransactionType.SEARCH && t.endpoint.includes('/restaurants'));
      
      expect(searchTransaction).toBeDefined();
      expect(searchTransaction.userId).toEqual(authUserId);
      expect(searchTransaction.description).toContain('Searched for restaurants');
    });
  });
}); 