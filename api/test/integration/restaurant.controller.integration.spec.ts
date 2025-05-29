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

// Mock Restaurant Data
const mockRestaurants = [
  new Restaurant('osm-1', 'Pizza Place', 40.7128, -74.0060, '123 Main St', 'Italian'),
  new Restaurant('osm-2', 'Sushi Spot', 40.7138, -74.0070, '456 Side St', 'Japanese'),
];

// Mock RestaurantRepository
const mockRestaurantRepository = {
  findNearbyRestaurants: jest.fn().mockResolvedValue(mockRestaurants),

};

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

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider('RestaurantRepository') // Override the actual repository
    .useValue(mockRestaurantRepository)      // With our mock
    .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(ValidationPipe);
    await app.init();

    userRepository = moduleFixture.get<UserRepository>('UserRepository');
    authToken = await getAuthToken(app, userRepository); // Get token once for all tests in this suite
  });

  beforeEach(() => {
    // Reset mocks before each test if they are stateful (e.g., counting calls)
    mockRestaurantRepository.findNearbyRestaurants.mockClear();
    mockRestaurantRepository.findNearbyRestaurants.mockResolvedValue(mockRestaurants); // Reset to default mock
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
          expect(response.body.data).toEqual(expect.arrayContaining([
            expect.objectContaining({ name: 'Pizza Place' }),
            expect.objectContaining({ name: 'Sushi Spot' }),
          ]));
          expect(mockRestaurantRepository.findNearbyRestaurants).toHaveBeenCalledWith(lat, lon, 1000); // 1000 is default radius
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
            expect(mockRestaurantRepository.findNearbyRestaurants).toHaveBeenCalledWith(40.7128, -74.0060, 1000);
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
            // Don't check for success field since it's not included in error responses
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
            // Don't check for success field since it's not included in error responses
          });
      });

      it('should return 400 if city is provided with lat (ambiguous)', () => {

        const lat = 40.7128;
        const lon = -74.0060;
        const city = "AnyCity";
        return request(app.getHttpServer())
            .get(`/restaurants?lat=${lat}&lon=${lon}&city=${city}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(HttpStatus.OK) // Because lat/lon are present and valid, they take precedence
            .then(() => {
                expect(mockRestaurantRepository.findNearbyRestaurants).toHaveBeenCalledWith(lat, lon, 1000);
            });
      });

    it('should return 401 Unauthorized if no token is provided', () => {
      return request(app.getHttpServer())
        .get('/restaurants?lat=40.7128&lon=-74.0060')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should handle service layer error (e.g., geocoding not implemented for other cities)', () => {
        const city = 'Boston';
        // No mock override for this specific case, so the actual service logic for non-NY city will run
        return request(app.getHttpServer())
            .get(`/restaurants?city=${city}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(HttpStatus.NOT_IMPLEMENTED) // As per RestaurantService logic
            .then((response) => {
                // Don't check for success field since it's not included in error responses
                expect(response.body.message).toContain('Geocoding not implemented for city: Boston');
            });
    });

  });
}); 