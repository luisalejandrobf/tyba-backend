import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, Max, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for finding nearby restaurants
 * 
 * This DTO supports two modes:
 * 1. Search by coordinates (latitude/longitude)
 * 2. Search by city name
 */
export class FindNearbyRestaurantsDto {
  @ApiPropertyOptional({
    description: 'Latitude coordinate',
    example: 40.7128,
    minimum: -90,
    maximum: 90,
  })
  @IsNumber()
  @Min(-90)
  @Max(90)
  @IsOptional()
  @Type(() => Number)
  @ValidateIf(o => !o.city || (o.lat && o.lon))
  lat?: number;

  @ApiPropertyOptional({
    description: 'Longitude coordinate',
    example: -74.0060,
    minimum: -180,
    maximum: 180,
  })
  @IsNumber()
  @Min(-180)
  @Max(180)
  @IsOptional()
  @Type(() => Number)
  @ValidateIf(o => !o.city || (o.lat && o.lon))
  lon?: number;

  @ApiPropertyOptional({
    description: 'City name for finding restaurants',
    example: 'New York',
  })
  @IsString()
  @IsOptional()
  @ValidateIf(o => !o.lat || !o.lon)
  city?: string;

  @ApiPropertyOptional({
    description: 'Search radius in meters (default: 1000)',
    example: 1000,
    minimum: 100,
    maximum: 5000,
  })
  @IsNumber()
  @Min(100)
  @Max(5000)
  @IsOptional()
  @Type(() => Number)
  radius?: number = 1000;
} 