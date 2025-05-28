import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Restaurant } from '../../../domain/entities/restaurant.entity';

/**
 * DTO for restaurant response data
 * 
 * This DTO maps the restaurant domain entity to a response object
 * that can be sent to the client
 */
export class RestaurantResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the restaurant',
    example: '419367357',
  })
  id: string;

  @ApiProperty({
    description: 'Name of the restaurant',
    example: 'Nha Trang One',
  })
  name: string;

  @ApiProperty({
    description: 'Latitude coordinate of the restaurant',
    example: 40.7167899,
  })
  latitude: number;

  @ApiProperty({
    description: 'Longitude coordinate of the restaurant',
    example: -73.9996711,
  })
  longitude: number;

  @ApiPropertyOptional({
    description: 'Address of the restaurant',
    example: '87 Baxter Street, New York, NY 10013',
  })
  address?: string;

  @ApiPropertyOptional({
    description: 'Type of cuisine served',
    example: 'vietnamese',
  })
  cuisine?: string;

  @ApiPropertyOptional({
    description: 'Contact phone number',
    example: '+1-212-233-5948',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Website URL',
    example: 'http://nhatrangnyc.com',
  })
  website?: string;

  @ApiPropertyOptional({
    description: 'Opening hours',
    example: 'Mo-Su 10:30-22:00',
  })
  openingHours?: string;

  /**
   * Factory method to create a response DTO from a domain entity
   * 
   * @param restaurant - The restaurant domain entity
   * @returns A RestaurantResponseDto for API responses
   */
  static fromEntity(restaurant: Restaurant): RestaurantResponseDto {
    const dto = new RestaurantResponseDto();
    dto.id = restaurant.id;
    dto.name = restaurant.name;
    dto.latitude = restaurant.latitude;
    dto.longitude = restaurant.longitude;
    dto.address = restaurant.address;
    dto.cuisine = restaurant.cuisine;
    dto.phone = restaurant.phone;
    dto.website = restaurant.website;
    dto.openingHours = restaurant.openingHours;
    return dto;
  }
} 