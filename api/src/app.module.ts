import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { RepositoriesModule } from './infrastructure/repositories/repositories.module';
import { AuthModule } from './application/services/auth/auth.module';
import { RestaurantModule } from './application/services/restaurant/restaurant.module';
import { TransactionModule } from './application/services/transaction/transaction.module';
import { AuthController } from './interfaces/controllers/auth.controller';
import { UserController } from './interfaces/controllers/user.controller';
import { RestaurantController } from './interfaces/controllers/restaurant.controller';
import { TransactionController } from './interfaces/controllers/transaction.controller';
import { TypeOrmConfigModule } from './infrastructure/typeorm/typeorm.module';
import { MiddlewaresModule } from './common/middlewares/middlewares.module';
import { TransactionLoggerMiddleware } from './common/middlewares/transaction-logger.middleware';

/**
 * Main application module
 * 
 * This module is the entry point of the application and
 * integrates all other modules together
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    TypeOrmConfigModule,
    RepositoriesModule,
    AuthModule,
    RestaurantModule,
    TransactionModule,
    MiddlewaresModule,
  ],
  controllers: [
    AppController, 
    AuthController, 
    UserController,
    RestaurantController,
    TransactionController,
  ],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TransactionLoggerMiddleware)
      .forRoutes('*');
  }
}
