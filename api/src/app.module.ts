import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { RepositoriesModule } from './infrastructure/repositories/repositories.module';
import { AuthModule } from './application/services/auth/auth.module';
import { AuthController } from './interfaces/controllers/auth.controller';
import { UserController } from './interfaces/controllers/user.controller';
import { TypeOrmConfigModule } from './infrastructure/typeorm/typeorm.module';

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
    TypeOrmConfigModule,
    RepositoriesModule,
    AuthModule,
  ],
  controllers: [AppController, AuthController, UserController],
  providers: [AppService],
})
export class AppModule {}
