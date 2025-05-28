import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

/**
 * JWT authentication strategy
 * 
 * Implements Passport JWT strategy for validating JWT tokens in requests
 * and extracting user information from the payload
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret') || 'fallback-secret-key',
      passReqToCallback: true,
    });
  }

  /**
   * Validate the JWT token and extract user information
   * 
   * This method is called by Passport when a JWT token needs validation
   * 
   * @param request - Express request object containing the token
   * @param payload - Decoded JWT payload containing user identifiers
   * @returns User information to be attached to the request
   * @throws UnauthorizedException if token is revoked or user not found
   */
  async validate(request: Request, payload: any) {
    // Extract the token from the request
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
    
    // Check if token is valid
    if (token && !this.authService.isTokenValid(token)) {
      throw new UnauthorizedException('Token has been revoked');
    }

    // Find user by ID
    const user = await this.userRepository.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Return user payload (without password)
    return {
      id: user.id,
      email: user.email,
    };
  }
} 