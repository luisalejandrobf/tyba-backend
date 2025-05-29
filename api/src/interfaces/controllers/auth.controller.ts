import { Body, Controller, Post, UseGuards, Request, Get, HttpStatus, HttpCode } from '@nestjs/common';
import { AuthService } from '../../application/services/auth/auth.service';
import { RegisterUserDto, LoginUserDto } from '../dtos/user';
import { ApiResponseDto } from '../dtos/common/api-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiOperation, ApiResponse, ApiTags, ApiBody, ApiBearerAuth, ApiExtraModels } from '@nestjs/swagger';

/**
 * Authentication controller
 * 
 * Handles HTTP requests related to user authentication:
 * - User registration
 * - User login/authentication
 * - User logout
 * - Retrieving authenticated user profile
 */
@Controller('auth')
@ApiTags('auth')
@ApiExtraModels(RegisterUserDto, LoginUserDto, ApiResponseDto)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user
   * 
   * @param registerUserDto - The user registration data
   * @returns Newly created user data (without password)
   * 
   * Example request:
   * ```
   * POST /auth/register
   * Content-Type: application/json
   * 
   * {
   *   "email": "user@example.com",
   *   "password": "Password123!",
   *   "passwordConfirmation": "Password123!"
   * }
   * ```
   * 
   * Example response:
   * ```
   * {
   *   "success": true,
   *   "message": "User registered successfully",
   *   "data": {
   *     "id": "550e8400-e29b-41d4-a716-446655440000",
   *     "email": "user@example.com",
   *     "createdAt": "2023-07-24T12:34:56.789Z",
   *     "updatedAt": "2023-07-24T12:34:56.789Z"
   *   }
   * }
   * ```
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterUserDto })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'User has been successfully registered',
    schema: {
      example: {
        success: true,
        message: 'User registered successfully',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          email: 'user@example.com',
          createdAt: '2023-07-24T12:34:56.789Z',
          updatedAt: '2023-07-24T12:34:56.789Z'
        }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Validation error or user already exists' })
  async register(@Body() registerUserDto: RegisterUserDto): Promise<ApiResponseDto<any>> {
    const user = await this.authService.register(registerUserDto);
    return ApiResponseDto.success('User registered successfully', user);
  }

  /**
   * Authenticate a user and generate a JWT token
   * 
   * @param loginUserDto - The user login credentials
   * @returns JWT token and user information
   * 
   * Example request:
   * ```
   * POST /auth/login
   * Content-Type: application/json
   * 
   * {
   *   "email": "user@example.com",
   *   "password": "Password123!"
   * }
   * ```
   * 
   * Example response:
   * ```
   * {
   *   "success": true,
   *   "message": "Login successful",
   *   "data": {
   *     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
   *     "user": {
   *       "id": "550e8400-e29b-41d4-a716-446655440000",
   *       "email": "user@example.com",
   *       "createdAt": "2023-07-24T12:34:56.789Z",
   *       "updatedAt": "2023-07-24T12:34:56.789Z"
   *     }
   *   }
   * }
   * ```
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login a user and get JWT token' })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'User has been successfully logged in',
    schema: {
      example: {
        success: true,
        message: 'Login successful',
        data: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          user: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            email: 'user@example.com',
            createdAt: '2023-07-24T12:34:56.789Z',
            updatedAt: '2023-07-24T12:34:56.789Z'
          }
        }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid credentials' })
  async login(@Body() loginUserDto: LoginUserDto): Promise<ApiResponseDto<any>> {
    const result = await this.authService.login(loginUserDto);
    return ApiResponseDto.success('Login successful', result);
  }

  /**
   * Logout a user by invalidating their JWT token
   * 
   * @param req - The request object containing the JWT token
   * @returns Success message
   * 
   * Example request:
   * ```
   * POST /auth/logout
   * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   * ```
   * 
   * Example response:
   * ```
   * {
   *   "success": true,
   *   "message": "Logout successful"
   * }
   * ```
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout a user and invalidate token' })
  @ApiBearerAuth()
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'User has been successfully logged out',
    schema: {
      example: {
        success: true,
        message: 'Logout successful'
      }
    }
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid or missing token' })
  async logout(@Request() req): Promise<ApiResponseDto<null>> {
    // Extract token from Authorization header
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      this.authService.logout(token);
    }
    return ApiResponseDto.success('Logout successful');
  }

  /**
   * Get the profile of the authenticated user
   * 
   * @param user - The authenticated user data
   * @returns User profile data
   * 
   * Example request:
   * ```
   * GET /auth/profile
   * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   * ```
   * 
   * Example response:
   * ```
   * {
   *   "success": true,
   *   "message": "Profile retrieved successfully",
   *   "data": {
   *     "id": "550e8400-e29b-41d4-a716-446655440000",
   *     "email": "user@example.com"
   *   }
   * }
   * ```
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get authenticated user profile' })
  @ApiBearerAuth()
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'User profile has been successfully retrieved',
    schema: {
      example: {
        success: true,
        message: 'Profile retrieved successfully',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          email: 'user@example.com'
        }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid or missing token' })
  getProfile(@CurrentUser() user: any): ApiResponseDto<any> {
    return ApiResponseDto.success('Profile retrieved successfully', user);
  }
} 