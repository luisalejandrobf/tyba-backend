import { Injectable, Inject } from '@nestjs/common';
import { RestaurantRepository } from '../../../domain/repositories/restaurant.repository';
import { Restaurant } from '../../../domain/entities/restaurant.entity';
import { FindNearbyRestaurantsDto } from '../../../interfaces/dtos/restaurant/find-nearby-restaurants.dto';
import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Restaurant service
 * 
 * Handles business logic related to restaurant operations
 */
@Injectable()
export class RestaurantService {
  constructor(
    @Inject('RestaurantRepository')
    private readonly restaurantRepository: RestaurantRepository,
  ) {}

  /**
   * Find restaurants near a specified location
   * 
   * @param params - Search parameters (coordinates or city)
   * @returns Array of restaurants within the specified radius
   */
  async findNearbyRestaurants(params: FindNearbyRestaurantsDto): Promise<Restaurant[]> {
    const { lat, lon, city, radius } = params;
    
    // If coordinates are provided directly
    if (lat !== undefined && lon !== undefined) {
      return this.restaurantRepository.findNearbyRestaurants(lat, lon, radius);
    }
    
    // If city is provided, we need to geocode it first
    if (city) {
      // For simplicity in this test, use hardcoded coordinates for New York
      // In a real implementation, this would call a geocoding service
      if (city.toLowerCase().includes('new york')) {
        return this.restaurantRepository.findNearbyRestaurants(40.7128, -74.0060, radius);
      } else {
        throw new HttpException(
          `Geocoding not implemented for city: ${city}. Please use coordinates instead.`,
          HttpStatus.NOT_IMPLEMENTED
        );
      }
    }
    
    throw new HttpException(
      'Either city or coordinates (lat/lon) must be provided',
      HttpStatus.BAD_REQUEST
    );
  }
} 