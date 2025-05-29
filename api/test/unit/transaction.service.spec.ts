import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from '../../src/application/services/transaction/transaction.service';
import { TransactionRepository } from '../../src/domain/repositories/transaction.repository';
import { Transaction, TransactionType } from '../../src/domain/entities/transaction.entity';
import { AppModule } from '../../src/app.module';
import { UserRepository } from '../../src/domain/repositories/user.repository';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { User } from '../../src/domain/entities/user.entity';

// Tests the transaction service for unit
describe('TransactionService', () => {
  let service: TransactionService;
  let transactionRepository: TransactionRepository;
  let userRepository: UserRepository;
  let userId: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    transactionRepository = module.get<TransactionRepository>('TransactionRepository');
    userRepository = module.get<UserRepository>('UserRepository');
    
    // Crear un usuario para las pruebas
    const email = `transaction-test-${randomUUID()}@example.com`;
    const passwordHash = await bcrypt.hash('password123', 10);
    const user = User.create(email, passwordHash);
    const createdUser = await userRepository.createUser(user);
    userId = createdUser.id;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Tests transaction retrieval functionality, validating proper
  // filtering of transactions by user ID
  describe('getUserTransactions', () => {
    it('should return transactions for a given user ID', async () => {
      // Primero crear una transacción para el usuario
      await service.createTransaction(
        userId, 
        TransactionType.SEARCH, 
        '/search', 
        '{}', 
        'Test Search'
      );
      
      const result = await service.getUserTransactions(userId);

      expect(result).toBeInstanceOf(Array);
      expect(result.some(t => t.userId === userId)).toBe(true);
    });
  });

  // Tests transaction creation functionality, validating proper
  // recording of transaction details
  describe('createTransaction', () => {
    it('should create and return a new transaction', async () => {
      const type = TransactionType.SEARCH;
      const endpoint = '/restaurants';
      const params = '{"lat":40.7128,"lon":-74.0060}';
      const description = 'Searched for restaurants';
      
      const result = await service.createTransaction(userId, type, endpoint, params, description);

      expect(result).toBeDefined();
      expect(result.userId).toBe(userId);
      expect(result.type).toBe(type);
      expect(result.endpoint).toBe(endpoint);
      expect(result.params).toBe(params);
      expect(result.description).toBe(description);
    });
  });
}); 