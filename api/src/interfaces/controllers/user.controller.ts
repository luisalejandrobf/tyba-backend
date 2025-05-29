import { Controller, Get, Param, UseGuards, NotFoundException, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiResponseDto } from '../dtos/common/api-response.dto';
import { Inject } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth, ApiParam, ApiExcludeController, ApiExtraModels } from '@nestjs/swagger';
import { UserDto } from '../dtos/user';

/**
 * User controller
 * 
 * Handles HTTP requests related to user operations:
 * - Retrieving current user profile
 * - Retrieving user by ID
 * 
 * All endpoints in this controller require authentication
 * 
 * Note: This controller is hidden from Swagger documentation
 */
@ApiExcludeController()
@Controller('users')
@UseGuards(JwtAuthGuard) // Protect all routes in this controller
@ApiBearerAuth()
@ApiExtraModels(UserDto, ApiResponseDto)
export class UserController {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  /**
   * Get the current user's profile
   * 
   * @param user - The authenticated user from the request
   * @returns Current user data without sensitive information
   * @throws NotFoundException if the user is not found
   * 
   * Example request:
   * ```
   * GET /users/me
   * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   * ```
   * 
   * Example response:
   * ```
   * {
   *   "success": true,
   *   "message": "User profile retrieved successfully",
   *   "data": {
   *     "id": "550e8400-e29b-41d4-a716-446655440000",
   *     "email": "user@example.com",
   *     "createdAt": "2023-07-24T12:34:56.789Z",
   *     "updatedAt": "2023-07-24T12:34:56.789Z"
   *   }
   * }
   * ```
   */
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getMe(@CurrentUser() user: UserDto): Promise<ApiResponseDto<UserDto>> {
    const userEntity = await this.userRepository.findById(user.id);
    if (!userEntity) {
      throw new NotFoundException('User not found');
    }
    
    // Return user without password hash
    const userDto: UserDto = {
      id: userEntity.id,
      email: userEntity.email,
      createdAt: userEntity.createdAt,
      updatedAt: userEntity.updatedAt
    };
    
    return ApiResponseDto.success('User profile retrieved successfully', userDto);
  }

  /**
   * Get a user by ID
   * 
   * @param id - The ID of the user to retrieve
   * @returns User data without sensitive information
   * @throws NotFoundException if the user is not found
   * 
   * Example request:
   * ```
   * GET /users/550e8400-e29b-41d4-a716-446655440000
   * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   * ```
   * 
   * Example response:
   * ```
   * {
   *   "success": true,
   *   "message": "User retrieved successfully",
   *   "data": {
   *     "id": "550e8400-e29b-41d4-a716-446655440000",
   *     "email": "user@example.com",
   *     "createdAt": "2023-07-24T12:34:56.789Z",
   *     "updatedAt": "2023-07-24T12:34:56.789Z"
   *   }
   * }
   * ```
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getUserById(@Param('id') id: string): Promise<ApiResponseDto<UserDto>> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Return user without password hash
    const userDto: UserDto = {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    return ApiResponseDto.success('User retrieved successfully', userDto);
  }
} 