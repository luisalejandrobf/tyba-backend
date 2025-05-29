import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { RestaurantService } from './restaurant.service';
import { OsmRestaurantRepository } from '../../../infrastructure/repositories/osm-restaurant.repository';
import { OsmRestaurantMapper } from '../../../infrastructure/mappers/osm-restaurant.mapper';

/**
 * Restaurant module
 * 
 * This module provides the restaurant service and required dependencies
 */
@Module({
  imports: [
    HttpModule,
  ],
  providers: [
    RestaurantService,
    OsmRestaurantMapper,
    {
      provide: 'RestaurantRepository',
      useClass: OsmRestaurantRepository,
    },
  ],
  exports: [RestaurantService],
})
export class RestaurantModule {} 