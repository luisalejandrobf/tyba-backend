import { Test, TestingModule } from '@nestjs/testing';
import { RestaurantService } from '../../src/application/services/restaurant/restaurant.service';
import { RestaurantRepository } from '../../src/domain/repositories/restaurant.repository';
import { Restaurant } from '../../src/domain/entities/restaurant.entity';
import { HttpException, HttpStatus } from '@nestjs/common';

// Mock RestaurantRepository
const mockRestaurantRepository = {
  findNearbyRestaurants: jest.fn(),
};

describe('RestaurantService', () => {
  let service: RestaurantService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RestaurantService,
        { provide: 'RestaurantRepository', useValue: mockRestaurantRepository },
      ],
    }).compile();

    service = module.get<RestaurantService>(RestaurantService);
    jest.clearAllMocks(); // Clear mocks before each test
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findNearbyRestaurants', () => {
    it('should return restaurants when lat and lon are provided', async () => {
      const params = { lat: 40.7128, lon: -74.0060, radius: 1000 };
      const mockRestaurants = [
        new Restaurant('1', 'Restaurant A', 40.7128, -74.0060),
        new Restaurant('2', 'Restaurant B', 40.7129, -74.0061),
      ];
      mockRestaurantRepository.findNearbyRestaurants.mockResolvedValue(mockRestaurants);

      const result = await service.findNearbyRestaurants(params);

      expect(result).toEqual(mockRestaurants);
      expect(mockRestaurantRepository.findNearbyRestaurants).toHaveBeenCalledWith(params.lat, params.lon, params.radius);
    });

    it('should use default coordinates for New York when city is New York', async () => {
        const params = { city: 'New York', radius: 1000 };
        const mockRestaurants = [
          new Restaurant('1', 'Restaurant A', 40.7128, -74.0060),
        ];
        mockRestaurantRepository.findNearbyRestaurants.mockResolvedValue(mockRestaurants);
  
        await service.findNearbyRestaurants(params);
  
        expect(mockRestaurantRepository.findNearbyRestaurants).toHaveBeenCalledWith(40.7128, -74.0060, params.radius);
      });

    it('should throw HttpException if city is not New York and no coordinates are provided', async () => {
      const params = { city: 'Boston', radius: 1000 };

      await expect(service.findNearbyRestaurants(params)).rejects.toThrow(
        new HttpException(
          `Geocoding not implemented for city: Boston. Please use coordinates instead.`,
          HttpStatus.NOT_IMPLEMENTED,
        ),
      );
      expect(mockRestaurantRepository.findNearbyRestaurants).not.toHaveBeenCalled();
    });

    it('should throw HttpException if neither city nor coordinates are provided', async () => {
      const params = { radius: 1000 }; // Missing lat, lon, and city

      await expect(service.findNearbyRestaurants(params)).rejects.toThrow(
        new HttpException(
          'Either city or coordinates (lat/lon) must be provided',
          HttpStatus.BAD_REQUEST,
        ),
      );
      expect(mockRestaurantRepository.findNearbyRestaurants).not.toHaveBeenCalled();
    });
  });
}); 