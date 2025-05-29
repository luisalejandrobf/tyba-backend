import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TransactionService } from '../../application/services/transaction/transaction.service';
import { TransactionType } from '../../domain/entities/transaction.entity';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';

/**
 * Middleware for logging user transactions
 * 
 * This middleware captures requests and logs them as transactions
 * associated with the authenticated user
 */
@Injectable()
export class TransactionLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TransactionLoggerMiddleware.name);

  constructor(
    private readonly transactionService: TransactionService,
    private readonly jwtService: JwtService,
    private readonly httpService: HttpService,
  ) {}

  /**
   * Middleware implementation
   * 
   * @param req - The HTTP request
   * @param res - The HTTP response
   * @param next - The next middleware function
   */
  async use(req: Request, res: Response, next: NextFunction) {
    // Get the full URL path
    const fullPath = req.originalUrl || req.url;
    this.logger.debug(`Processing request: ${req.method} ${fullPath}`);

    // If the path is /transactions, we'll still log it but handle it specially to avoid infinite recursion
    const isTransactionsRequest = fullPath.startsWith('/transactions');
    
    // Skip user/me requests to avoid infinite recursion
    if (fullPath.includes('/users/me') && !isTransactionsRequest) {
      this.logger.debug(`Skipping logging for path: ${fullPath}`);
      return next();
    }

    try {
      // For login requests, we need special handling to capture the user ID after successful login
      if (fullPath.includes('/auth/login')) {
        const loginEmail = req.body?.email || 'unknown';
        const self = this; // Store reference to middleware instance
        
        // Create a function to handle the response after login
        const originalSend = res.send;
        res.send = function(body) {
          // Restore original send
          res.send = originalSend;
          
          // Only log successful logins (status 200 or 201)
          if (res.statusCode === 200 || res.statusCode === 201) {
            try {
              // Parse the response body if it's a string
              const responseBody = typeof body === 'string' ? JSON.parse(body) : body;
              
              if (responseBody && responseBody.data && responseBody.data.token) {
                // Extract user ID from the token
                const token = responseBody.data.token;
                const payload = self.jwtService.decode(token);
                
                if (payload && payload.sub) {
                  const userId = payload.sub;
                  
                  // Log the login with the actual user ID
                  self.transactionService.createTransaction(
                    userId,
                    TransactionType.AUTH,
                    fullPath,
                    JSON.stringify({
                      query: req.query,
                      body: { email: loginEmail, password: '[REDACTED]' }
                    }),
                    `User login: ${loginEmail}`
                  ).catch(error => {
                    self.logger.error(`Error logging login transaction: ${error.message}`);
                  });
                }
              }
            } catch (error) {
              self.logger.error(`Error processing login response: ${error.message}`);
            }
          }
          
          // Call the original send method
          return originalSend.call(this, body);
        };
        
        // Continue with the request
        return next();
      }
      
      // Handle transactions requests specially to avoid infinite recursion
      if (isTransactionsRequest) {
        // Get auth token if present
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return next();
        }

        const token = authHeader.split(' ')[1];
        let userId: string;
        
        try {
          // Decode token to get user ID
          const payload = this.jwtService.decode(token);
          if (!payload || !payload.sub) {
            return next();
          }
          userId = payload.sub;
          
          // Log a simplified transaction for transactions requests
          await this.transactionService.createTransaction(
            userId,
            TransactionType.TRANSACTION,
            fullPath,
            '{}', // Minimal params to avoid recursion
            'Viewed transaction history'
          );
          
          this.logger.debug('Logged transaction history view');
        } catch (error) {
          this.logger.error(`Error logging transactions request: ${error.message}`);
        }
        
        return next();
      }

      // For all other requests, use the normal flow
      // Get auth token if present
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        this.logger.debug('No authorization token found, skipping transaction logging');
        return next();
      }

      const token = authHeader.split(' ')[1];
      let userId: string;
      
      try {
        // Decode token to get user ID
        const payload = this.jwtService.decode(token);
        if (!payload || !payload.sub) {
          this.logger.debug('Invalid token payload, skipping transaction logging');
          return next();
        }
        userId = payload.sub;
        this.logger.debug(`User ID from token: ${userId}`);
      } catch (error) {
        // Token is invalid, skip logging
        this.logger.error(`Error decoding token: ${error.message}`);
        return next();
      }

      // Explicitly determine transaction type based on path
      let type: TransactionType = TransactionType.TRANSACTION; // Default
      let description = `${req.method} request to ${fullPath}`;
      
      // AUTH type determination
      if (fullPath.includes('/auth/login')) {
        type = TransactionType.AUTH;
        description = 'User login';
        this.logger.debug('Identified as AUTH transaction: login');
      } 
      else if (fullPath.includes('/auth/register')) {
        type = TransactionType.AUTH;
        description = 'User registration';
        this.logger.debug('Identified as AUTH transaction: register');
      } 
      else if (fullPath.includes('/auth/logout')) {
        type = TransactionType.AUTH;
        description = 'User logout';
        this.logger.debug('Identified as AUTH transaction: logout');
      } 
      else if (fullPath.includes('/auth/profile')) {
        type = TransactionType.AUTH;
        description = 'Accessed user profile';
        this.logger.debug('Identified as AUTH transaction: profile');
      }
      // SEARCH type determination 
      else if (fullPath.includes('/restaurants')) {
        type = TransactionType.SEARCH;
        
        // Check query parameters
        if (req.query.lat && req.query.lon) {
          description = `Searched for restaurants near coordinates (${req.query.lat}, ${req.query.lon})`;
        } else if (req.query.city) {
          description = `Searched for restaurants in city: ${req.query.city}`;
        } else {
          description = 'Searched for restaurants';
        }
        this.logger.debug('Identified as SEARCH transaction');
      }
      // Default TRANSACTION type for other endpoints
      else {
        type = TransactionType.TRANSACTION;
        this.logger.debug('Using default TRANSACTION type');
      }

      // Sanitize request parameters to remove sensitive information
      const sanitizedQuery = { ...req.query };
      const sanitizedBody = req.method !== 'GET' ? { ...req.body } : undefined;
      
      // Remove sensitive fields
      if (sanitizedBody) {
        if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
        if (sanitizedBody.passwordConfirmation) sanitizedBody.passwordConfirmation = '[REDACTED]';
        if (sanitizedBody.currentPassword) sanitizedBody.currentPassword = '[REDACTED]';
        if (sanitizedBody.newPassword) sanitizedBody.newPassword = '[REDACTED]';
      }

      // Create transaction with sanitized parameters
      const params = JSON.stringify({
        query: sanitizedQuery,
        body: sanitizedBody,
      });

      this.logger.debug(`Creating transaction: type=${type}, endpoint=${fullPath}, description=${description}`);
      
      // Log the transaction
      const transaction = await this.transactionService.createTransaction(
        userId,
        type,
        fullPath, // Use the full path as the endpoint
        params,
        description,
      );
      
      this.logger.debug(`Transaction created successfully: ${transaction.id}`);
    } catch (error) {
      // Don't block the request if transaction logging fails
      this.logger.error(`Transaction logging failed: ${error.message}`, error.stack);
    }

    next();
  }
} 