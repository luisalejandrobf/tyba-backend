import { Injectable } from '@nestjs/common';
import { Restaurant } from '../../domain/entities/restaurant.entity';

/**
 * Interface representing OpenStreetMap node data structure
 */
export interface OsmNode {
  id: number;
  type: string;
  lat: number;
  lon: number;
  tags: {
    name?: string;
    cuisine?: string;
    phone?: string;
    website?: string;
    opening_hours?: string;
    'addr:housenumber'?: string;
    'addr:street'?: string;
    'addr:city'?: string;
    'addr:state'?: string;
    'addr:postcode'?: string;
    [key: string]: string | undefined;
  };
}

/**
 * Mapper for transforming OpenStreetMap data to Restaurant domain entities
 */
@Injectable()
export class OsmRestaurantMapper {
  /**
   * Maps an OpenStreetMap node to a Restaurant domain entity
   * 
   * @param osmNode - The OpenStreetMap node data
   * @returns A Restaurant domain entity
   */
  mapToRestaurant(osmNode: OsmNode): Restaurant {
    // Extract the tags and base properties
    const { id, lat, lon, tags } = osmNode;
    
    // Format address from components if available
    let address: string | undefined;
    if (tags['addr:housenumber'] && tags['addr:street']) {
      address = `${tags['addr:housenumber']} ${tags['addr:street']}`;
      
      if (tags['addr:city']) {
        address += `, ${tags['addr:city']}`;
      }
      
      if (tags['addr:state']) {
        address += `, ${tags['addr:state']}`;
      }
      
      if (tags['addr:postcode']) {
        address += ` ${tags['addr:postcode']}`;
      }
    }

    return new Restaurant(
      id.toString(),
      tags.name || 'Unnamed Restaurant',
      lat,
      lon,
      address,
      tags.cuisine,
      tags.phone,
      tags.website,
      tags.opening_hours,
    );
  }

  /**
   * Maps multiple OpenStreetMap nodes to Restaurant domain entities
   * 
   * @param osmNodes - Array of OpenStreetMap node data
   * @returns Array of Restaurant domain entities
   */
  mapToRestaurants(osmNodes: any[]): Restaurant[] {
    return osmNodes
      .filter((element): element is OsmNode => 
        element.type === 'node' && element.tags && element.tags.name)
      .map((node) => this.mapToRestaurant(node));
  }
} 