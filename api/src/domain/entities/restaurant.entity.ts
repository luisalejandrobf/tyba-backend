/**
 * Restaurant domain entity
 * 
 * This class represents a restaurant in the domain model and
 * encapsulates the data structure for restaurants
 */
export class Restaurant {
  constructor(
    private readonly _id: string,
    private readonly _name: string,
    private readonly _latitude: number,
    private readonly _longitude: number,
    private readonly _address?: string,
    private readonly _cuisine?: string,
    private readonly _phone?: string,
    private readonly _website?: string,
    private readonly _openingHours?: string,
  ) {}

  // Getters
  /**
   * Get the restaurant's ID
   */
  get id(): string {
    return this._id;
  }

  /**
   * Get the restaurant's name
   */
  get name(): string {
    return this._name;
  }

  /**
   * Get the restaurant's latitude
   */
  get latitude(): number {
    return this._latitude;
  }

  /**
   * Get the restaurant's longitude
   */
  get longitude(): number {
    return this._longitude;
  }

  /**
   * Get the restaurant's address
   */
  get address(): string | undefined {
    return this._address;
  }

  /**
   * Get the restaurant's cuisine type
   */
  get cuisine(): string | undefined {
    return this._cuisine;
  }

  /**
   * Get the restaurant's phone number
   */
  get phone(): string | undefined {
    return this._phone;
  }

  /**
   * Get the restaurant's website
   */
  get website(): string | undefined {
    return this._website;
  }

  /**
   * Get the restaurant's opening hours
   */
  get openingHours(): string | undefined {
    return this._openingHours;
  }

  /**
   * Factory method for creating a Restaurant instance from OpenStreetMap data
   * 
   * @param osmNode - The OpenStreetMap node data
   * @returns A Restaurant instance
   */
  static fromOsmData(osmNode: any): Restaurant {
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
} 