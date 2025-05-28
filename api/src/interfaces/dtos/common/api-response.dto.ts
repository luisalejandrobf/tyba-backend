import { ApiProperty } from '@nestjs/swagger';

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

  private constructor(success: boolean, message: string, data?: T, error?: any) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.error = error;
  }

  static success<T>(message: string, data?: T): ApiResponseDto<T> {
    return new ApiResponseDto<T>(true, message, data);
  }

  static error<T>(message: string, error?: any): ApiResponseDto<T> {
    return new ApiResponseDto<T>(false, message, undefined, error);
  }
} 