import { ApiProperty } from '@nestjs/swagger';

/**
 * Standard API response data transfer object
 * 
 * This class provides a consistent structure for all API responses
 * with success status, message, data payload, and optional error details that can be any type.
 * 
 * @template T The type of data contained in the response
 */
export class ApiResponseDto<T> {
  @ApiProperty({
    description: 'Indicates if the operation was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Message describing the result of the operation',
    example: 'Operation completed successfully',
  })
  message: string;

  @ApiProperty({
    description: 'The data returned by the operation',
    example: {},
    required: false,
  })
  data?: T;

  @ApiProperty({
    description: 'Error details in case of failure',
    example: null,
    required: false,
  })
  error?: any;

  /**
   * Private constructor to enforce factory method usage
   * 
   * @param success - Whether the operation was successful
   * @param message - Message describing the result
   * @param data - Optional data payload
   * @param error - Optional error details
   */
  private constructor(success: boolean, message: string, data?: T, error?: any) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.error = error;
  }

  /**
   * Creates a successful response
   * 
   * @param message - Success message
   * @param data - Optional data payload
   * @returns A successful API response
   */
  static success<T>(message: string, data?: T): ApiResponseDto<T> {
    return new ApiResponseDto<T>(true, message, data);
  }

  /**
   * Creates an error response
   * 
   * @param message - Error message
   * @param error - Optional error details
   * @returns An error API response
   */
  static error<T>(message: string, error?: any): ApiResponseDto<T> {
    return new ApiResponseDto<T>(false, message, undefined, error);
  }
} 