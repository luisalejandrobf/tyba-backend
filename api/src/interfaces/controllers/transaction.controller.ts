import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TransactionService } from '../../application/services/transaction/transaction.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TransactionResponseDto } from '../dtos/transaction/transaction-response.dto';
import { ApiResponseDto } from '../dtos/common/api-response.dto';

/**
 * Transaction controller
 * 
 * Handles HTTP requests related to transaction operations:
 * - Getting user's transaction history
 */
@Controller('transactions')
@ApiTags('transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  /**
   * Get the transaction history for the authenticated user
   * 
   * @param user - The authenticated user data
   * @returns Array of user's transactions
   * 
   * Example request:
   * ```
   * GET /transactions
   * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   * ```
   */
  @Get()
  @ApiOperation({ summary: 'Get transaction history for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'List of transactions for the authenticated user',
    schema: {
      example: {
        success: true,
        message: 'Transactions retrieved successfully',
        data: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            userId: '550e8400-e29b-41d4-a716-446655440001',
            type: 'SEARCH',
            endpoint: '/restaurants',
            params: '{"lat":40.7128,"lon":-74.0060}',
            description: 'Searched for restaurants near coordinates',
            createdAt: '2023-07-24T12:34:56.789Z'
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440002',
            userId: '550e8400-e29b-41d4-a716-446655440001',
            type: 'AUTH',
            endpoint: '/auth/login',
            params: '{"email":"user@example.com"}',
            description: 'User login',
            createdAt: '2023-07-24T12:30:56.789Z'
          }
        ]
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or expired token' })
  async getUserTransactions(
    @CurrentUser() user: any,
  ): Promise<ApiResponseDto<TransactionResponseDto[]>> {
    const transactions = await this.transactionService.getUserTransactions(user.id);
    
    const transactionDtos = transactions.map(transaction => 
      TransactionResponseDto.fromEntity(transaction)
    );
    
    return ApiResponseDto.success(
      'Transactions retrieved successfully',
      transactionDtos
    );
  }
} 