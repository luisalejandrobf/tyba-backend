import { ApiProperty } from '@nestjs/swagger';
import { Transaction, TransactionType } from '../../../domain/entities/transaction.entity';

/**
 * DTO for transaction response data
 * 
 * This DTO maps the transaction domain entity to a response object
 * that can be sent to the client
 */
export class TransactionResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the transaction',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'User ID associated with the transaction',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  userId: string;

  @ApiProperty({
    description: 'Type of transaction',
    enum: TransactionType,
    example: TransactionType.SEARCH,
  })
  type: TransactionType;

  @ApiProperty({
    description: 'API endpoint accessed',
    example: '/restaurants',
  })
  endpoint: string;

  @ApiProperty({
    description: 'Parameters used in the request',
    example: '{"lat":40.7128,"lon":-74.0060}',
  })
  params: string;

  @ApiProperty({
    description: 'Description of the transaction',
    example: 'Searched for restaurants near coordinates',
  })
  description: string;

  @ApiProperty({
    description: 'Date and time when the transaction was created',
    example: '2023-07-24T12:34:56.789Z',
  })
  createdAt: Date;

  /**
   * Factory method to create a response DTO from a domain entity
   * 
   * @param transaction - The transaction domain entity
   * @returns A TransactionResponseDto for API responses
   */
  static fromEntity(transaction: Transaction): TransactionResponseDto {
    const dto = new TransactionResponseDto();
    dto.id = transaction.id;
    dto.userId = transaction.userId;
    dto.type = transaction.type;
    dto.endpoint = transaction.endpoint;
    dto.params = transaction.params;
    dto.description = transaction.description;
    dto.createdAt = transaction.createdAt;
    return dto;
  }
} 