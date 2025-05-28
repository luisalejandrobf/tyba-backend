import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { RestaurantService } from './restaurant.service';
import { OsmRestaurantRepository } from '../../../infrastructure/repositories/osm-restaurant.repository';

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
    {
      provide: 'RestaurantRepository',
      useClass: OsmRestaurantRepository,
    },
  ],
  exports: [RestaurantService],
})
export class RestaurantModule {} 