import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import { ValidationPipe } from '../../src/common/pipes/validation.pipe';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { RestaurantRepository } from '../../src/domain/repositories/restaurant.repository';
import { Restaurant } from '../../src/domain/entities/restaurant.entity';
import { AuthService } from '../../src/application/services/auth/auth.service';
import { UserRepository } from '../../src/domain/repositories/user.repository';
import { User } from '../../src/domain/entities/user.entity';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';

// Helper to create and login a user, returns a token
async function getAuthToken(app: INestApplication, userRepository: UserRepository): Promise<string> {
    const email = `resto-test-${randomUUID()}@example.com`;
    const password = 'Password123!';
    const passwordHash = await bcrypt.hash(password, 10);
    const user = User.create(email, passwordHash);
    await userRepository.createUser(user);

    const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password })
        .expect(HttpStatus.OK);
    return loginResponse.body.data.token;
}

describe('RestaurantController (Integration)', () => {
  let app: INestApplication;
  let authToken: string;
  let userRepository: UserRepository;
  let restaurantRepository: RestaurantRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(ValidationPipe);
    await app.init();

    userRepository = moduleFixture.get<UserRepository>('UserRepository');
    restaurantRepository = moduleFixture.get<RestaurantRepository>('RestaurantRepository');
    authToken = await getAuthToken(app, userRepository); // Get token once for all tests in this suite
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/restaurants (GET)', () => {
    it('should find nearby restaurants with lat and lon query params', () => {
      const lat = 40.7128;
      const lon = -74.0060;
      return request(app.getHttpServer())
        .get(`/restaurants?lat=${lat}&lon=${lon}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.OK)
        .then((response) => {
          expect(response.body.success).toBe(true);
          expect(response.body.message).toEqual('Restaurants found successfully');
          expect(response.body.data).toBeInstanceOf(Array);
          // No verificamos nombres específicos ya que los datos reales pueden variar
        });
    });

    it('should find nearby restaurants with city query param (New York hardcoded)', () => {
        const city = 'New York';
        return request(app.getHttpServer())
          .get(`/restaurants?city=${city}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(HttpStatus.OK)
          .then((response) => {
            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeInstanceOf(Array);
          });
      });

    it('should return 400 if lat is provided without lon', () => {
        return request(app.getHttpServer())
          .get('/restaurants?lat=40.7128')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(HttpStatus.BAD_REQUEST)
          .then((response) => {
            // The error comes from the service, not class-validator
            expect(response.body.message).toBe('Either city or coordinates (lat/lon) must be provided');
          });
      });

      it('should return 400 if lon is provided without lat', () => {
        return request(app.getHttpServer())
          .get('/restaurants?lon=-74.0060')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(HttpStatus.BAD_REQUEST)
          .then((response) => {
            // The error comes from the service, not class-validator
            expect(response.body.message).toBe('Either city or coordinates (lat/lon) must be provided');
          });
      });

      it('should use lat/lon when both city and coordinates are provided', () => {
        const lat = 40.7128;
        const lon = -74.0060;
        const city = "AnyCity";
        return request(app.getHttpServer())
            .get(`/restaurants?lat=${lat}&lon=${lon}&city=${city}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(HttpStatus.OK)
            .then((response) => {
              expect(response.body.success).toBe(true);
              expect(response.body.data).toBeInstanceOf(Array);
            });
      });

    it('should return 401 Unauthorized if no token is provided', () => {
      return request(app.getHttpServer())
        .get('/restaurants?lat=40.7128&lon=-74.0060')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should handle service layer error for non-implemented cities', () => {
        const city = 'Boston';
        return request(app.getHttpServer())
            .get(`/restaurants?city=${city}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(HttpStatus.NOT_IMPLEMENTED)
            .then((response) => {
                expect(response.body.message).toContain('Geocoding not implemented for city: Boston');
            });
    });
  });
}); 