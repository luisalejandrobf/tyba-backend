import { Test, TestingModule } from '@nestjs/testing';
import { RestaurantService } from '../../src/application/services/restaurant/restaurant.service';
import { RestaurantRepository } from '../../src/domain/repositories/restaurant.repository';
import { Restaurant } from '../../src/domain/entities/restaurant.entity';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AppModule } from '../../src/app.module';

// Tests the restaurant service for unit
describe('RestaurantService', () => {
  let service: RestaurantService;
  let repository: RestaurantRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    service = module.get<RestaurantService>(RestaurantService);
    repository = module.get<RestaurantRepository>('RestaurantRepository');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Tests restaurant search functionality, validating proper handling
  // of various input parameter combinations and error scenarios
  describe('findNearbyRestaurants', () => {
    it('should return restaurants when lat and lon are provided', async () => {
      const params = { lat: 40.7128, lon: -74.0060, radius: 1000 };
      
      const result = await service.findNearbyRestaurants(params);
      
      expect(result).toBeInstanceOf(Array);
    });

    it('should use default coordinates for New York when city is New York', async () => {
      const params = { city: 'New York', radius: 1000 };
      
      const result = await service.findNearbyRestaurants(params);
      
      expect(result).toBeInstanceOf(Array);
    });

    it('should throw HttpException if city is not New York and no coordinates are provided', async () => {
      const params = { city: 'Boston', radius: 1000 };

      await expect(service.findNearbyRestaurants(params)).rejects.toThrow(
        new HttpException(
          `Geocoding not implemented for city: Boston. Please use coordinates instead.`,
          HttpStatus.NOT_IMPLEMENTED,
        ),
      );
    });

    it('should throw HttpException if neither city nor coordinates are provided', async () => {
      const params = { radius: 1000 }; // Missing lat, lon, and city

      await expect(service.findNearbyRestaurants(params)).rejects.toThrow(
        new HttpException(
          'Either city or coordinates (lat/lon) must be provided',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });
  });
}); 