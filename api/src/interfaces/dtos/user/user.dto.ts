import { ApiProperty } from '@nestjs/swagger';

/**
 * Data transfer object for user data
 * 
 * Represents user data that is safe to return in API responses
 * (excludes sensitive information like password hash)
 */
export class UserDto {
  @ApiProperty({
    description: 'User unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Date when the user was created',
    example: '2023-07-24T12:34:56.789Z',
    required: false,
  })
  createdAt?: Date;

  @ApiProperty({
    description: 'Date when the user was last updated',
    example: '2023-07-24T12:34:56.789Z',
    required: false,
  })
  updatedAt?: Date;
}

/**
 * Data transfer object for JWT payload
 * 
 * Represents the structure of data stored in JWT tokens
 */
export class JwtPayloadDto {
  @ApiProperty({
    description: 'Subject (user ID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  sub: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Issued at timestamp',
    example: 1627142096,
    required: false,
  })
  iat?: number;

  @ApiProperty({
    description: 'Expiration timestamp',
    example: 1627145696,
    required: false,
  })
  exp?: number;
} 