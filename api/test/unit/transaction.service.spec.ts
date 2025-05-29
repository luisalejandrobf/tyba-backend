import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from '../../src/application/services/transaction/transaction.service';
import { TransactionRepository } from '../../src/domain/repositories/transaction.repository';
import { Transaction, TransactionType } from '../../src/domain/entities/transaction.entity';

// Mock TransactionRepository
const mockTransactionRepository = {
  createTransaction: jest.fn(),
  findByUserId: jest.fn(),
};

describe('TransactionService', () => {
  let service: TransactionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        { provide: 'TransactionRepository', useValue: mockTransactionRepository },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    jest.clearAllMocks(); // Clear mocks before each test
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserTransactions', () => {
    it('should return transactions for a given user ID', async () => {
      const userId = 'user123';
      const mockTransactions = [
        Transaction.create(userId, TransactionType.SEARCH, '/search', '{}', 'Search 1'),
        Transaction.create(userId, TransactionType.AUTH, '/login', '{}', 'Login'),
      ];
      mockTransactionRepository.findByUserId.mockResolvedValue(mockTransactions);

      const result = await service.getUserTransactions(userId);

      expect(result).toEqual(mockTransactions);
      expect(mockTransactionRepository.findByUserId).toHaveBeenCalledWith(userId);
    });
  });

  describe('createTransaction', () => {
    it('should create and return a new transaction', async () => {
      const userId = 'user123';
      const type = TransactionType.SEARCH;
      const endpoint = '/restaurants';
      const params = '{"lat":40.7128,"lon":-74.0060}';
      const description = 'Searched for restaurants';
      
      const mockTransaction = Transaction.create(userId, type, endpoint, params, description);
      mockTransactionRepository.createTransaction.mockResolvedValue(mockTransaction);

      const result = await service.createTransaction(userId, type, endpoint, params, description);

      expect(result).toEqual(mockTransaction);
      expect(mockTransactionRepository.createTransaction).toHaveBeenCalledWith(expect.any(Transaction));
      // You could add more specific checks for the properties of the transaction passed to createTransaction
      const createdTransactionArg = mockTransactionRepository.createTransaction.mock.calls[0][0] as Transaction;
      expect(createdTransactionArg.userId).toBe(userId);
      expect(createdTransactionArg.type).toBe(type);
      expect(createdTransactionArg.endpoint).toBe(endpoint);
      expect(createdTransactionArg.params).toBe(params);
      expect(createdTransactionArg.description).toBe(description);
    });
  });
}); 