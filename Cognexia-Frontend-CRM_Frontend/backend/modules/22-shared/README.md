# Shared Module (22-shared)

## Overview

The **Shared Module** is the foundational library for all Industry 5.0 ERP modules. It provides common utilities, services, types, decorators, guards, interceptors, and core functionality that are shared across all manufacturing modules. This module ensures consistency, reduces code duplication, and provides enterprise-grade common services.

## Features

### Core Utilities
- **Type Definitions**: Common TypeScript interfaces and types
- **Utility Functions**: Helper functions for data manipulation and validation
- **Constants & Enums**: System-wide constants and enumeration values
- **Configuration Management**: Centralized configuration handling
- **Error Handling**: Standardized error classes and exception handling

### Security Components
- **Authentication Guards**: JWT and role-based access control
- **Authorization Decorators**: Method-level permission decorators
- **Encryption Utilities**: Data encryption and hashing functions
- **Security Interceptors**: Request/response security processing
- **Input Validation**: Comprehensive input sanitization

### Data Management
- **Database Utilities**: Common database operations and helpers
- **Caching Services**: Redis-based caching abstractions
- **Queue Management**: Background job processing utilities
- **Event Handling**: Event-driven architecture components
- **Data Transformation**: DTO transformers and mappers

## Architecture

### Technology Stack
- **Framework**: NestJS with TypeScript
- **Validation**: Class-validator, Joi, Yup, Zod
- **Security**: JWT, bcrypt, helmet, crypto-js
- **Caching**: Redis, node-cache, LRU cache
- **Events**: EventEmitter3, mitt
- **Utilities**: Lodash, moment, uuid, winston

## Module Structure

```
22-shared/
├── src/
│   ├── decorators/          # Custom decorators
│   ├── guards/              # Authentication guards
│   ├── interceptors/        # Request/response interceptors
│   ├── middleware/          # Express middleware
│   ├── pipes/               # Validation pipes
│   ├── filters/             # Exception filters
│   ├── services/            # Common services
│   ├── utils/               # Utility functions
│   ├── types/               # TypeScript type definitions
│   ├── constants/           # Application constants
│   ├── enums/               # Enumeration values
│   └── index.ts             # Module exports
├── test/                    # Test files
└── docs/                    # Documentation
```

## Core Services

### Authentication Service
```typescript
@Injectable()
export class AuthService {
  async validateJwtPayload(payload: JwtPayload): Promise<User | null> {
    const user = await this.userService.findById(payload.sub);
    if (!user || !user.isActive) {
      return null;
    }
    return user;
  }
  
  async generateTokens(user: User): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
    };
    
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: await this.generateRefreshToken(user.id),
    };
  }
}
```

### Caching Service
```typescript
@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private redisService: RedisService,
  ) {}
  
  async get<T>(key: string): Promise<T | null> {
    return await this.cacheManager.get<T>(key);
  }
  
  async set<T>(
    key: string, 
    value: T, 
    ttl: number = 3600
  ): Promise<void> {
    await this.cacheManager.set(key, value, { ttl });
  }
  
  async invalidate(pattern: string): Promise<void> {
    const keys = await this.redisService.keys(pattern);
    if (keys.length > 0) {
      await this.cacheManager.del(keys);
    }
  }
}
```

### Event Service
```typescript
@Injectable()
export class EventService extends EventEmitter {
  async publishEvent<T>(eventName: string, payload: T): Promise<void> {
    this.emit(eventName, {
      eventName,
      payload,
      timestamp: new Date(),
      source: 'industry5.0-erp',
    });
  }
  
  subscribeToEvent<T>(
    eventName: string,
    handler: (event: SystemEvent<T>) => Promise<void>
  ): void {
    this.on(eventName, handler);
  }
}
```

## Common Decorators

### Role-Based Access Control
```typescript
export const Roles = (...roles: UserRole[]) => 
  SetMetadata('roles', roles);

export const Public = () => 
  SetMetadata('isPublic', true);

export const ApiKey = () => 
  SetMetadata('requireApiKey', true);

// Usage example
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  @Get('users')
  @Roles(UserRole.ADMIN, UserRole.SUPER_USER)
  async getUsers() {
    return this.userService.findAll();
  }
}
```

### Validation Decorators
```typescript
export const IsValidUUID = (validationOptions?: ValidationOptions) =>
  ValidateBy({
    name: 'isValidUUID',
    validator: {
      validate: (value: any) => isUUID(value, 4),
      defaultMessage: buildMessage(
        (eachPrefix) => eachPrefix + '$property must be a valid UUID',
        validationOptions,
      ),
    },
  }, validationOptions);

export const IsManufacturingDate = (validationOptions?: ValidationOptions) =>
  ValidateBy({
    name: 'isManufacturingDate',
    validator: {
      validate: (value: any) => {
        const date = new Date(value);
        const now = new Date();
        return date <= now && date >= new Date('2020-01-01');
      },
      defaultMessage: 'Manufacturing date must be valid and not in the future',
    },
  }, validationOptions);
```

## Security Components

### JWT Auth Guard
```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }
  
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      return true;
    }
    
    return super.canActivate(context);
  }
}
```

### Rate Limiting Guard
```typescript
@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly limiter = new Map<string, { count: number; reset: number }>();
  
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const key = this.getKey(request);
    const limit = this.getLimit(context);
    const window = this.getWindow(context);
    
    const now = Date.now();
    const limiterData = this.limiter.get(key);
    
    if (!limiterData || now > limiterData.reset) {
      this.limiter.set(key, { count: 1, reset: now + window });
      return true;
    }
    
    if (limiterData.count >= limit) {
      throw new ThrottlerException();
    }
    
    limiterData.count++;
    return true;
  }
}
```

## Data Transformation

### Base DTO Transformer
```typescript
export abstract class BaseTransformer<Entity, DTO> {
  abstract toDto(entity: Entity): DTO;
  abstract toEntity(dto: DTO): Partial<Entity>;
  
  toDtoArray(entities: Entity[]): DTO[] {
    return entities.map(entity => this.toDto(entity));
  }
  
  toEntityArray(dtos: DTO[]): Partial<Entity>[] {
    return dtos.map(dto => this.toEntity(dto));
  }
}

// Example implementation
export class UserTransformer extends BaseTransformer<User, UserDto> {
  toDto(user: User): UserDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }
  
  toEntity(dto: CreateUserDto): Partial<User> {
    return {
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      passwordHash: dto.password, // This would be hashed in service
    };
  }
}
```

## Utility Functions

### Data Validation
```typescript
export class ValidationUtils {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  static isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }
  
  static sanitizeHtml(input: string): string {
    return sanitizeHtml(input, {
      allowedTags: [],
      allowedAttributes: {},
    });
  }
}
```

### Date/Time Utilities
```typescript
export class DateUtils {
  static addBusinessDays(date: Date, days: number): Date {
    let result = new Date(date);
    let addedDays = 0;
    
    while (addedDays < days) {
      result.setDate(result.getDate() + 1);
      if (result.getDay() !== 0 && result.getDay() !== 6) { // Not weekend
        addedDays++;
      }
    }
    
    return result;
  }
  
  static isBusinessDay(date: Date): boolean {
    const day = date.getDay();
    return day !== 0 && day !== 6; // Not Sunday or Saturday
  }
  
  static formatForManufacturing(date: Date): string {
    return format(date, 'yyyy-MM-dd HH:mm:ss');
  }
}
```

### File Processing
```typescript
export class FileUtils {
  static async processUploadedFile(
    file: Express.Multer.File,
    options: FileProcessingOptions = {}
  ): Promise<ProcessedFile> {
    // Validate file type
    if (options.allowedTypes && !options.allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type');
    }
    
    // Check file size
    if (options.maxSize && file.size > options.maxSize) {
      throw new BadRequestException('File too large');
    }
    
    // Generate unique filename
    const extension = path.extname(file.originalname);
    const filename = `${nanoid()}${extension}`;
    
    return {
      originalName: file.originalname,
      filename,
      mimetype: file.mimetype,
      size: file.size,
      buffer: file.buffer,
    };
  }
}
```

## Performance Monitoring

### Performance Interceptor
```typescript
@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PerformanceInterceptor.name);
  
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    
    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - start;
          this.logger.log(`${method} ${url} - ${duration}ms`);
          
          if (duration > 5000) { // Log slow requests
            this.logger.warn(`Slow request: ${method} ${url} - ${duration}ms`);
          }
        },
        error: (error) => {
          const duration = Date.now() - start;
          this.logger.error(`${method} ${url} - ${duration}ms - Error: ${error.message}`);
        },
      })
    );
  }
}
```

## Error Handling

### Global Exception Filter
```typescript
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
  
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';
    
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message = (exceptionResponse as any).message || exception.message;
        code = (exceptionResponse as any).code || exception.constructor.name;
      } else {
        message = exceptionResponse as string;
      }
    }
    
    const errorResponse: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      code,
    };
    
    this.logger.error(
      `${request.method} ${request.url}`,
      JSON.stringify(errorResponse),
      'GlobalExceptionFilter',
    );
    
    response.status(status).json(errorResponse);
  }
}
```

## Configuration

### Module Configuration
```typescript
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST'),
        port: configService.get('REDIS_PORT'),
        ttl: 3600,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    CacheService,
    EventService,
    UserTransformer,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: PerformanceInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
  exports: [
    AuthService,
    CacheService,
    EventService,
    UserTransformer,
  ],
})
export class SharedModule {}
```

## Testing Utilities

### Test Helpers
```typescript
export class TestUtils {
  static createMockUser(overrides: Partial<User> = {}): User {
    return {
      id: uuidv4(),
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      isActive: true,
      roles: [UserRole.USER],
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }
  
  static async createTestModule(
    providers: Provider[] = [],
    imports: any[] = []
  ): Promise<TestingModule> {
    return Test.createTestingModule({
      imports: [SharedModule, ...imports],
      providers: [...providers],
    }).compile();
  }
}
```

## API Documentation

### Swagger Decorators
```typescript
export const ApiErrorResponses = () => {
  return applyDecorators(
    ApiBadRequestResponse({
      description: 'Bad Request',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 400 },
          message: { type: 'string' },
          timestamp: { type: 'string' },
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
    ApiInternalServerErrorResponse({
      description: 'Internal Server Error',
    }),
  );
};
```

## Performance Optimization

### Database Query Optimization
```typescript
export class QueryOptimizer {
  static optimizeQuery<T>(
    queryBuilder: SelectQueryBuilder<T>,
    options: QueryOptions = {}
  ): SelectQueryBuilder<T> {
    // Add pagination
    if (options.limit) {
      queryBuilder.limit(options.limit);
    }
    
    if (options.offset) {
      queryBuilder.offset(options.offset);
    }
    
    // Add eager loading for specified relations
    if (options.relations) {
      options.relations.forEach(relation => {
        queryBuilder.leftJoinAndSelect(`entity.${relation}`, relation);
      });
    }
    
    // Add caching if specified
    if (options.cache) {
      queryBuilder.cache(options.cacheDuration || 3600000); // 1 hour default
    }
    
    return queryBuilder;
  }
}
```

## License

This module is part of the Industry 5.0 ERP system and is licensed under the MIT License.

## Support

For technical support:
- Email: shared@ezai-mfgninja.com
- Documentation: https://docs.ezai-mfgninja.com/shared
- Issue Tracker: https://github.com/ezai-mfg-ninja/industry5.0-shared/issues
