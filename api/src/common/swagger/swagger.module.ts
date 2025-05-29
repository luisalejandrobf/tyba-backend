import { Module } from '@nestjs/common';
import { ApiExtraModels } from '@nestjs/swagger';
import { RegisterUserDto, LoginUserDto, UserDto, JwtPayloadDto } from '../../interfaces/dtos/user';
import { TransactionResponseDto } from '../../interfaces/dtos/transaction/transaction-response.dto';
import { FindNearbyRestaurantsDto } from '../../interfaces/dtos/restaurant/find-nearby-restaurants.dto';
import { RestaurantResponseDto } from '../../interfaces/dtos/restaurant/restaurant-response.dto';
import { ApiResponseDto } from '../../interfaces/dtos/common/api-response.dto';

/**
 * Swagger module that configures API documentation
 * 
 * This module ensures all DTOs are properly exposed in Swagger
 */
@Module({})
@ApiExtraModels(
  RegisterUserDto,
  LoginUserDto,
  UserDto,
  JwtPayloadDto,
  TransactionResponseDto,
  FindNearbyRestaurantsDto,
  RestaurantResponseDto,
  ApiResponseDto
)
export class SwaggerModule {} 