import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RestaurantService } from '../../application/services/restaurant/restaurant.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { FindNearbyRestaurantsDto } from '../dtos/restaurant/find-nearby-restaurants.dto';
import { RestaurantResponseDto } from '../dtos/restaurant/restaurant-response.dto';
import { ApiResponseDto } from '../dtos/common/api-response.dto';

/**
 * Restaurant controller
 * 
 * Handles HTTP requests related to restaurant operations:
 * - Finding nearby restaurants
 */
@Controller('restaurants')
@ApiTags('restaurants')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  /**
   * Find restaurants near a specified location
   * 
   * @param query - Query parameters for the search
   * @returns List of restaurants
   * 
   * Example request:
   * ```
   * GET /restaurants?lat=40.7128&lon=-74.0060
   * ```
   * 
   * OR
   * 
   * ```
   * GET /restaurants?city=New%20York
   * ```
   */
  @Get()
  @ApiOperation({ summary: 'Find restaurants near a location' })
  @ApiResponse({
    status: 200,
    description: 'List of restaurants found near the specified location',
    schema: {
      example: {
        success: true,
        message: 'Restaurants found successfully',
        data: [
          {
            id: '419367357',
            name: 'Nha Trang One',
            latitude: 40.7167899,
            longitude: -73.9996711,
            address: '87 Baxter Street, New York, NY 10013',
            cuisine: 'vietnamese',
            phone: '+1-212-233-5948',
            website: 'http://nhatrangnyc.com',
            openingHours: 'Mo-Su 10:30-22:00'
          },
          {
            id: '1396581104',
            name: 'Hoy Wong Restaurant',
            latitude: 40.7166141,
            longitude: -73.9980030,
            address: '81 Mott street, New York'
          }
        ]
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - missing required parameters' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or expired token' })
  async findNearbyRestaurants(
    @Query() query: FindNearbyRestaurantsDto,
  ): Promise<ApiResponseDto<RestaurantResponseDto[]>> {
    const restaurants = await this.restaurantService.findNearbyRestaurants(query);
    
    const restaurantDtos = restaurants.map(restaurant => 
      RestaurantResponseDto.fromEntity(restaurant)
    );
    
    return ApiResponseDto.success(
      'Restaurants found successfully',
      restaurantDtos
    );
  }
} 