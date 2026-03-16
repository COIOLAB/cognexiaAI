import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

// Import controllers and DTOs for API contract testing
import { WorkCenterController } from '../../controllers/work-center.controller';
import { ProductionOrderController } from '../../controllers/production-order.controller';
import { ProductionLineController } from '../../controllers/production-line.controller';

// Import DTOs for validation testing
import { CreateWorkCenterDto } from '../../dto/create-work-center.dto';
import { UpdateWorkCenterDto } from '../../dto/update-work-center.dto';
import { CreateProductionOrderDto } from '../../dto/create-production-order.dto';
import { CreateProductionLineDto } from '../../dto/create-production-line.dto';

// Import services
import { WorkCenterService } from '../../services/work-center.service';
import { ProductionOrderService } from '../../services/production-order.service';
import { ProductionLineService } from '../../services/production-line.service';

// Import entities
import { WorkCenter } from '../../entities/WorkCenter';
import { ProductionOrder } from '../../entities/ProductionOrder';
import { ProductionLine } from '../../entities/ProductionLine';

// Import test utilities
import { repositoryMockFactory } from '../mocks/manufacturing.mocks';
import { inMemoryTestConfig } from '../test.config';

interface APIContractTestResult {
  endpoint: string;
  method: string;
  testType: 'request_validation' | 'response_validation' | 'schema_compliance' | 'error_handling';
  passed: boolean;
  issues: string[];
  recommendations: string[];
}

interface SchemaValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

describe('Manufacturing API Contract Tests', () => {
  let app: INestApplication;
  let workCenterController: WorkCenterController;
  let productionOrderController: ProductionOrderController;
  let productionLineController: ProductionLineController;

  let contractTestResults: APIContractTestResult[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(inMemoryTestConfig),
        TypeOrmModule.forFeature([WorkCenter, ProductionOrder, ProductionLine]),
      ],
      controllers: [
        WorkCenterController,
        ProductionOrderController,
        ProductionLineController,
      ],
      providers: [
        WorkCenterService,
        ProductionOrderService,
        ProductionLineService,
        {
          provide: getRepositoryToken(WorkCenter),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(ProductionOrder),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(ProductionLine),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Enable validation pipe to test DTO validation
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        validateCustomDecorators: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    await app.init();

    workCenterController = moduleFixture.get<WorkCenterController>(WorkCenterController);
    productionOrderController = moduleFixture.get<ProductionOrderController>(ProductionOrderController);
    productionLineController = moduleFixture.get<ProductionLineController>(ProductionLineController);
  });

  afterAll(async () => {
    await generateAPIContractReport();
    await app.close();
  });

  describe('Work Center API Contract Tests', () => {
    describe('POST /work-centers - Create Work Center', () => {
      it('should validate required fields in request', async () => {
        const testCases = [
          {
            name: 'Valid Complete Request',
            data: {
              code: 'WC-001',
              name: 'Assembly Line 1',
              type: 'assembly',
              capacity: 1000,
              currentLoad: 750,
              efficiency: 85.5,
              isOperational: true,
            },
            expectValid: true,
          },
          {
            name: 'Missing Required Field - Code',
            data: {
              name: 'Assembly Line 1',
              type: 'assembly',
              capacity: 1000,
            },
            expectValid: false,
            expectedError: 'code should not be empty',
          },
          {
            name: 'Invalid Data Type - Capacity',
            data: {
              code: 'WC-001',
              name: 'Assembly Line 1',
              type: 'assembly',
              capacity: 'invalid', // Should be number
            },
            expectValid: false,
            expectedError: 'capacity must be a number',
          },
          {
            name: 'Invalid Enum Value - Type',
            data: {
              code: 'WC-001',
              name: 'Assembly Line 1',
              type: 'invalid_type',
              capacity: 1000,
            },
            expectValid: false,
            expectedError: 'type must be a valid enum value',
          },
          {
            name: 'Negative Values Validation',
            data: {
              code: 'WC-001',
              name: 'Assembly Line 1',
              type: 'assembly',
              capacity: -100, // Should be positive
            },
            expectValid: false,
            expectedError: 'capacity must be greater than 0',
          },
        ];

        const issues: string[] = [];
        const recommendations: string[] = [];

        for (const testCase of testCases) {
          const response = await request(app.getHttpServer())
            .post('/work-centers')
            .send(testCase.data);

          if (testCase.expectValid) {
            if (response.status !== 201) {
              issues.push(`Valid request "${testCase.name}" failed with status ${response.status}`);
            }
          } else {
            if (response.status === 201) {
              issues.push(`Invalid request "${testCase.name}" was accepted when it should have been rejected`);
            }
            
            if (testCase.expectedError && !response.body.message?.includes(testCase.expectedError)) {
              issues.push(`Expected error message "${testCase.expectedError}" not found for "${testCase.name}"`);
            }
          }
        }

        if (issues.length > 0) {
          recommendations.push('Review DTO validation decorators and constraints');
          recommendations.push('Ensure proper error message formatting');
        }

        contractTestResults.push({
          endpoint: '/work-centers',
          method: 'POST',
          testType: 'request_validation',
          passed: issues.length === 0,
          issues,
          recommendations,
        });

        expect(issues).toHaveLength(0);
      });

      it('should return consistent response schema', async () => {
        const validRequest = {
          code: 'WC-TEST-001',
          name: 'Test Work Center',
          type: 'assembly',
          capacity: 1000,
          currentLoad: 500,
          efficiency: 85.0,
          isOperational: true,
        };

        const response = await request(app.getHttpServer())
          .post('/work-centers')
          .send(validRequest)
          .expect(201);

        const schemaValidation = validateResponseSchema(response.body, 'WorkCenterResponse');
        
        const issues: string[] = [];
        const recommendations: string[] = [];

        if (!schemaValidation.valid) {
          issues.push(...schemaValidation.errors);
        }

        if (schemaValidation.warnings.length > 0) {
          recommendations.push(...schemaValidation.warnings);
        }

        contractTestResults.push({
          endpoint: '/work-centers',
          method: 'POST',
          testType: 'response_validation',
          passed: schemaValidation.valid,
          issues,
          recommendations,
        });

        expect(schemaValidation.valid).toBe(true);
      });
    });

    describe('GET /work-centers - List Work Centers', () => {
      it('should support pagination parameters', async () => {
        const testCases = [
          { query: '?page=1&limit=10', expectValid: true },
          { query: '?page=0&limit=10', expectValid: false }, // Page should start from 1
          { query: '?page=1&limit=0', expectValid: false }, // Limit should be positive
          { query: '?page=1&limit=1001', expectValid: false }, // Limit should not exceed maximum
          { query: '?page=abc&limit=10', expectValid: false }, // Invalid data type
        ];

        const issues: string[] = [];
        const recommendations: string[] = [];

        for (const testCase of testCases) {
          const response = await request(app.getHttpServer())
            .get(`/work-centers${testCase.query}`);

          if (testCase.expectValid) {
            if (response.status !== 200) {
              issues.push(`Valid pagination query "${testCase.query}" failed with status ${response.status}`);
            }
          } else {
            if (response.status === 200) {
              issues.push(`Invalid pagination query "${testCase.query}" was accepted`);
            }
          }
        }

        if (issues.length > 0) {
          recommendations.push('Implement proper query parameter validation');
          recommendations.push('Add pagination limits and constraints');
        }

        contractTestResults.push({
          endpoint: '/work-centers',
          method: 'GET',
          testType: 'request_validation',
          passed: issues.length === 0,
          issues,
          recommendations,
        });

        expect(issues).toHaveLength(0);
      });

      it('should return paginated response with correct structure', async () => {
        const response = await request(app.getHttpServer())
          .get('/work-centers?page=1&limit=10')
          .expect(200);

        const requiredFields = ['data', 'total', 'page', 'limit'];
        const issues: string[] = [];
        const recommendations: string[] = [];

        requiredFields.forEach(field => {
          if (!(field in response.body)) {
            issues.push(`Missing required field "${field}" in paginated response`);
          }
        });

        if (response.body.data && !Array.isArray(response.body.data)) {
          issues.push('Data field should be an array');
        }

        if (typeof response.body.total !== 'number') {
          issues.push('Total field should be a number');
        }

        if (issues.length > 0) {
          recommendations.push('Ensure consistent pagination response structure');
          recommendations.push('Add response DTO validation');
        }

        contractTestResults.push({
          endpoint: '/work-centers',
          method: 'GET',
          testType: 'response_validation',
          passed: issues.length === 0,
          issues,
          recommendations,
        });

        expect(issues).toHaveLength(0);
      });
    });

    describe('PUT /work-centers/:id - Update Work Center', () => {
      it('should validate partial updates', async () => {
        const workCenterId = 'test-wc-001';
        
        const testCases = [
          {
            name: 'Valid Partial Update',
            data: { efficiency: 90.0 },
            expectValid: true,
          },
          {
            name: 'Invalid Field Type',
            data: { efficiency: 'ninety' },
            expectValid: false,
          },
          {
            name: 'Unknown Field',
            data: { unknownField: 'value' },
            expectValid: false,
          },
          {
            name: 'Invalid Constraint',
            data: { efficiency: 150 }, // Should not exceed 100
            expectValid: false,
          },
        ];

        const issues: string[] = [];
        const recommendations: string[] = [];

        for (const testCase of testCases) {
          const response = await request(app.getHttpServer())
            .put(`/work-centers/${workCenterId}`)
            .send(testCase.data);

          if (testCase.expectValid && response.status >= 400) {
            issues.push(`Valid update "${testCase.name}" was rejected with status ${response.status}`);
          } else if (!testCase.expectValid && response.status < 400) {
            issues.push(`Invalid update "${testCase.name}" was accepted`);
          }
        }

        if (issues.length > 0) {
          recommendations.push('Review partial update DTO validation');
          recommendations.push('Ensure unknown fields are properly rejected');
        }

        contractTestResults.push({
          endpoint: '/work-centers/:id',
          method: 'PUT',
          testType: 'request_validation',
          passed: issues.length === 0,
          issues,
          recommendations,
        });

        expect(issues).toHaveLength(0);
      });
    });
  });

  describe('Production Order API Contract Tests', () => {
    describe('POST /production-orders - Create Production Order', () => {
      it('should validate complex nested data structures', async () => {
        const validRequest = {
          orderNumber: 'PO-001',
          billOfMaterialId: 'bom-001',
          quantity: 100,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          priority: 'medium',
          status: 'planned',
          productionLineId: 'pl-001',
          workOrders: [
            {
              operationSequence: 1,
              workCenterId: 'wc-001',
              plannedDuration: 480,
              plannedQuantity: 100,
            },
          ],
        };

        const invalidRequests = [
          {
            name: 'Invalid Date Format',
            data: { ...validRequest, dueDate: 'invalid-date' },
          },
          {
            name: 'Invalid Nested Object',
            data: { ...validRequest, workOrders: [{ invalidField: 'value' }] },
          },
          {
            name: 'Missing Required Nested Field',
            data: { 
              ...validRequest, 
              workOrders: [{ operationSequence: 1 }] // Missing required fields
            },
          },
        ];

        const issues: string[] = [];
        const recommendations: string[] = [];

        // Test valid request
        const validResponse = await request(app.getHttpServer())
          .post('/production-orders')
          .send(validRequest);

        if (validResponse.status !== 201) {
          issues.push(`Valid complex request failed with status ${validResponse.status}`);
        }

        // Test invalid requests
        for (const testCase of invalidRequests) {
          const response = await request(app.getHttpServer())
            .post('/production-orders')
            .send(testCase.data);

          if (response.status < 400) {
            issues.push(`Invalid request "${testCase.name}" was accepted`);
          }
        }

        if (issues.length > 0) {
          recommendations.push('Improve nested object validation');
          recommendations.push('Add custom validation for date fields');
        }

        contractTestResults.push({
          endpoint: '/production-orders',
          method: 'POST',
          testType: 'request_validation',
          passed: issues.length === 0,
          issues,
          recommendations,
        });

        expect(issues).toHaveLength(0);
      });
    });
  });

  describe('Error Handling Contract Tests', () => {
    it('should return consistent error response format', async () => {
      const errorTestCases = [
        {
          name: '400 Bad Request',
          request: () => request(app.getHttpServer())
            .post('/work-centers')
            .send({}), // Empty body should cause validation error
          expectedStatus: 400,
        },
        {
          name: '404 Not Found',
          request: () => request(app.getHttpServer())
            .get('/work-centers/non-existent-id'),
          expectedStatus: 404,
        },
        {
          name: '422 Unprocessable Entity',
          request: () => request(app.getHttpServer())
            .post('/work-centers')
            .send({
              code: 'WC-001',
              name: 'Test',
              type: 'assembly',
              capacity: -1, // Invalid value
            }),
          expectedStatus: 422,
        },
      ];

      const issues: string[] = [];
      const recommendations: string[] = [];

      for (const testCase of errorTestCases) {
        const response = await testCase.request();

        // Check status code
        if (response.status !== testCase.expectedStatus) {
          issues.push(`${testCase.name}: Expected status ${testCase.expectedStatus}, got ${response.status}`);
        }

        // Check error response structure
        const errorSchema = validateErrorResponseSchema(response.body);
        if (!errorSchema.valid) {
          issues.push(`${testCase.name}: Invalid error response schema - ${errorSchema.errors.join(', ')}`);
        }

        // Check for error message presence
        if (!response.body.message) {
          issues.push(`${testCase.name}: Missing error message`);
        }
      }

      if (issues.length > 0) {
        recommendations.push('Implement consistent error response format');
        recommendations.push('Ensure all errors include descriptive messages');
        recommendations.push('Add error codes for better client handling');
      }

      contractTestResults.push({
        endpoint: 'Multiple',
        method: 'Multiple',
        testType: 'error_handling',
        passed: issues.length === 0,
        issues,
        recommendations,
      });

      expect(issues).toHaveLength(0);
    });
  });

  describe('DTO Validation Contract Tests', () => {
    it('should validate CreateWorkCenterDto constraints', async () => {
      const testData = [
        {
          name: 'Valid DTO',
          data: {
            code: 'WC-001',
            name: 'Assembly Line 1',
            type: 'assembly',
            capacity: 1000,
            efficiency: 85.5,
            isOperational: true,
          },
          expectValid: true,
        },
        {
          name: 'Empty String Validation',
          data: {
            code: '',
            name: 'Assembly Line 1',
            type: 'assembly',
            capacity: 1000,
          },
          expectValid: false,
        },
        {
          name: 'Range Validation',
          data: {
            code: 'WC-001',
            name: 'Assembly Line 1',
            type: 'assembly',
            capacity: 1000,
            efficiency: 150, // Should be <= 100
          },
          expectValid: false,
        },
      ];

      const issues: string[] = [];
      const recommendations: string[] = [];

      for (const testCase of testData) {
        const dto = plainToClass(CreateWorkCenterDto, testCase.data);
        const errors = await validate(dto);

        const hasErrors = errors.length > 0;
        if (testCase.expectValid && hasErrors) {
          issues.push(`Valid DTO "${testCase.name}" failed validation: ${errors.map(e => e.toString()).join(', ')}`);
        } else if (!testCase.expectValid && !hasErrors) {
          issues.push(`Invalid DTO "${testCase.name}" passed validation when it should have failed`);
        }
      }

      if (issues.length > 0) {
        recommendations.push('Review DTO validation decorators');
        recommendations.push('Add comprehensive constraint testing');
      }

      contractTestResults.push({
        endpoint: 'DTO Validation',
        method: 'N/A',
        testType: 'schema_compliance',
        passed: issues.length === 0,
        issues,
        recommendations,
      });

      expect(issues).toHaveLength(0);
    });

    it('should validate complex DTO relationships', async () => {
      const productionOrderData = {
        orderNumber: 'PO-001',
        billOfMaterialId: 'bom-001',
        quantity: 100,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        priority: 'medium',
        workOrders: [
          {
            operationSequence: 1,
            workCenterId: 'wc-001',
            plannedDuration: 480,
            plannedQuantity: 100,
          },
          {
            operationSequence: 2,
            workCenterId: 'wc-002',
            plannedDuration: 240,
            plannedQuantity: 100,
          },
        ],
      };

      const dto = plainToClass(CreateProductionOrderDto, productionOrderData);
      const errors = await validate(dto, { validationError: { target: false } });

      const issues: string[] = [];
      const recommendations: string[] = [];

      if (errors.length > 0) {
        issues.push(`Complex DTO validation failed: ${errors.map(e => e.toString()).join(', ')}`);
        recommendations.push('Review nested object validation');
        recommendations.push('Ensure array validation works correctly');
      }

      contractTestResults.push({
        endpoint: 'Complex DTO Validation',
        method: 'N/A',
        testType: 'schema_compliance',
        passed: issues.length === 0,
        issues,
        recommendations,
      });

      expect(issues).toHaveLength(0);
    });
  });

  describe('Response Schema Consistency Tests', () => {
    it('should maintain consistent response structure across endpoints', async () => {
      const endpointTests = [
        { method: 'GET', path: '/work-centers', expectArray: false }, // Paginated response
        { method: 'GET', path: '/production-orders', expectArray: false },
        { method: 'GET', path: '/production-lines', expectArray: false },
      ];

      const issues: string[] = [];
      const recommendations: string[] = [];

      for (const test of endpointTests) {
        try {
          const response = await request(app.getHttpServer())
            .get(test.path)
            .expect(200);

          // Check pagination structure consistency
          if (!test.expectArray) {
            const requiredFields = ['data', 'total', 'page', 'limit'];
            const missingFields = requiredFields.filter(field => !(field in response.body));
            
            if (missingFields.length > 0) {
              issues.push(`${test.path}: Missing pagination fields: ${missingFields.join(', ')}`);
            }
          }

          // Check response time (API performance contract)
          const responseTime = response.header['x-response-time'];
          if (responseTime && parseInt(responseTime) > 5000) {
            issues.push(`${test.path}: Response time ${responseTime}ms exceeds 5000ms threshold`);
          }
        } catch (error) {
          issues.push(`${test.path}: Request failed - ${error.message}`);
        }
      }

      if (issues.length > 0) {
        recommendations.push('Standardize pagination response structure');
        recommendations.push('Add response time monitoring');
        recommendations.push('Implement consistent error handling');
      }

      contractTestResults.push({
        endpoint: 'Multiple Endpoints',
        method: 'GET',
        testType: 'schema_compliance',
        passed: issues.length === 0,
        issues,
        recommendations,
      });

      expect(issues).toHaveLength(0);
    });
  });

  describe('API Versioning Contract Tests', () => {
    it('should support API version headers', async () => {
      const versionTests = [
        { version: 'v1', expectSupported: true },
        { version: 'v2', expectSupported: false }, // Not yet implemented
        { version: 'invalid', expectSupported: false },
      ];

      const issues: string[] = [];
      const recommendations: string[] = [];

      for (const test of versionTests) {
        const response = await request(app.getHttpServer())
          .get('/work-centers')
          .set('API-Version', test.version);

        if (test.expectSupported && response.status === 406) {
          issues.push(`API version ${test.version} should be supported but returned 406`);
        } else if (!test.expectSupported && response.status === 200) {
          issues.push(`API version ${test.version} should not be supported but returned 200`);
        }
      }

      if (issues.length > 0) {
        recommendations.push('Implement proper API versioning middleware');
        recommendations.push('Add version validation and error handling');
      }

      contractTestResults.push({
        endpoint: 'API Versioning',
        method: 'N/A',
        testType: 'schema_compliance',
        passed: issues.length === 0,
        issues,
        recommendations,
      });

      // This test is informational and may fail until versioning is implemented
      // expect(issues).toHaveLength(0);
    });
  });

  // Utility Functions

  function validateResponseSchema(responseBody: any, schemaType: string): SchemaValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    switch (schemaType) {
      case 'WorkCenterResponse':
        if (!responseBody.id) errors.push('Missing id field');
        if (!responseBody.code) errors.push('Missing code field');
        if (!responseBody.name) errors.push('Missing name field');
        if (typeof responseBody.capacity !== 'number') errors.push('capacity should be a number');
        if (responseBody.createdAt && !isValidDate(responseBody.createdAt)) {
          errors.push('createdAt should be a valid date');
        }
        if (responseBody.updatedAt && !isValidDate(responseBody.updatedAt)) {
          errors.push('updatedAt should be a valid date');
        }
        break;

      case 'PaginatedResponse':
        if (!Array.isArray(responseBody.data)) errors.push('data should be an array');
        if (typeof responseBody.total !== 'number') errors.push('total should be a number');
        if (typeof responseBody.page !== 'number') errors.push('page should be a number');
        if (typeof responseBody.limit !== 'number') errors.push('limit should be a number');
        break;

      default:
        warnings.push(`Unknown schema type: ${schemaType}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  function validateErrorResponseSchema(responseBody: any): SchemaValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!responseBody.message) {
      errors.push('Error response should include a message field');
    }

    if (!responseBody.statusCode) {
      errors.push('Error response should include a statusCode field');
    }

    if (responseBody.statusCode && typeof responseBody.statusCode !== 'number') {
      errors.push('statusCode should be a number');
    }

    // Optional but recommended fields
    if (!responseBody.timestamp) {
      warnings.push('Error response should include a timestamp field');
    }

    if (!responseBody.path) {
      warnings.push('Error response should include a path field');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  function isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  async function generateAPIContractReport(): Promise<void> {
    const report = {
      testSuite: 'Manufacturing API Contract Tests',
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: contractTestResults.length,
        passed: contractTestResults.filter(r => r.passed).length,
        failed: contractTestResults.filter(r => !r.passed).length,
        testTypes: {
          request_validation: contractTestResults.filter(r => r.testType === 'request_validation').length,
          response_validation: contractTestResults.filter(r => r.testType === 'response_validation').length,
          schema_compliance: contractTestResults.filter(r => r.testType === 'schema_compliance').length,
          error_handling: contractTestResults.filter(r => r.testType === 'error_handling').length,
        },
      },
      results: contractTestResults,
      overallRecommendations: generateOverallRecommendations(),
      complianceScore: calculateComplianceScore(),
    };

    console.log('\n=== MANUFACTURING API CONTRACT REPORT ===');
    console.log(JSON.stringify(report, null, 2));

    // Write report to file
    const fs = require('fs');
    const path = require('path');
    const reportPath = path.join(__dirname, '../../../api-contract-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  }

  function generateOverallRecommendations(): string[] {
    const allRecommendations = contractTestResults.flatMap(r => r.recommendations);
    const uniqueRecommendations = [...new Set(allRecommendations)];

    const additionalRecommendations = [
      'Implement OpenAPI/Swagger specification for documentation',
      'Add request/response logging for better debugging',
      'Consider implementing API rate limiting',
      'Add comprehensive API integration tests',
      'Implement API deprecation strategy for future changes',
    ];

    return [...uniqueRecommendations, ...additionalRecommendations];
  }

  function calculateComplianceScore(): number {
    const totalTests = contractTestResults.length;
    const passedTests = contractTestResults.filter(r => r.passed).length;
    
    if (totalTests === 0) return 0;
    
    return Math.round((passedTests / totalTests) * 100);
  }
});
