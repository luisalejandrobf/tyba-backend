import { Restaurant } from '../entities/restaurant.entity';

/**
 * Repository interface for Restaurant entities
 * 
 * This interface defines the contract for restaurant data retrieval operations
 * and serves as a port in the hexagonal architecture
 */
export interface RestaurantRepository {
  /**
   * Find restaurants near the given coordinates
   * 
   * @param latitude - The latitude coordinate
   * @param longitude - The longitude coordinate
   * @param radius - The search radius in meters
   * @returns Array of restaurants found within the radius
   */
  findNearbyRestaurants(
    latitude: number,
    longitude: number,
    radius?: number,
  ): Promise<Restaurant[]>;
} 