import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RestaurantRepository } from '../../domain/repositories/restaurant.repository';
import { Restaurant } from '../../domain/entities/restaurant.entity';
import { lastValueFrom } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AxiosError } from 'axios';

/**
 * OpenStreetMap restaurant repository implementation
 * 
 * This class implements the RestaurantRepository interface
 * using the OpenStreetMap Overpass API as a data source
 */
@Injectable()
export class OsmRestaurantRepository implements RestaurantRepository {
  private readonly logger = new Logger(OsmRestaurantRepository.name);
  private readonly overpassApiUrl = 'https://overpass-api.de/api/interpreter';

  constructor(private readonly httpService: HttpService) {}

  /**
   * Find restaurants near the given coordinates using OpenStreetMap
   * 
   * @param latitude - The latitude coordinate
   * @param longitude - The longitude coordinate
   * @param radius - The search radius in meters (default: 1000)
   * @returns Array of restaurants found within the radius
   */
  async findNearbyRestaurants(
    latitude: number,
    longitude: number,
    radius: number = 1000,
  ): Promise<Restaurant[]> {
    // Build the Overpass API query
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="restaurant"](around:${radius},${latitude},${longitude});
        way["amenity"="restaurant"](around:${radius},${latitude},${longitude});
        relation["amenity"="restaurant"](around:${radius},${latitude},${longitude});
      );
      out body;
      >;
      out skel qt;
    `;

    try {
      // Make the request to Overpass API
      const response = await lastValueFrom(
        this.httpService.get(this.overpassApiUrl, {
          params: { data: query },
        }).pipe(
          map((response) => response.data),
          catchError((error: AxiosError) => {
            this.logger.error(`Error fetching from Overpass API: ${error.message}`);
            throw error;
          }),
        ),
      );

      // Filter for nodes only (for simplicity) and map to Restaurant domain entities
      const restaurants = response.elements
        .filter((element) => element.type === 'node' && element.tags && element.tags.name)
        .map((node) => Restaurant.fromOsmData(node));

      return restaurants;
    } catch (error) {
      this.logger.error(`Failed to fetch restaurants: ${error.message}`);
      return []; // Return empty array in case of error
    }
  }
} 