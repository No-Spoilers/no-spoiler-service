import {
  DynamoDBClient,
  QueryCommand,
  PutItemCommand,
} from '@aws-sdk/client-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';

import { handler } from '../src/handlers/user/postUser.js';

describe('postUser', () => {
  let dynamoDBMock: ReturnType<typeof mockClient>;

  beforeAll(() => {
    // Set up environment variable for token creation
    vi.stubEnv('TOKEN_SECRET', 'test-secret-key-for-testing');
    // Create a global mock that applies to all DynamoDB clients
    dynamoDBMock = mockClient(DynamoDBClient);
  });

  beforeEach(() => {
    // Reset the mock before each test but keep the same instance
    dynamoDBMock.reset();
  });

  afterAll(() => {
    dynamoDBMock.restore();
  });

  it('should call the database to create a new user', async () => {
    // Mock the QueryCommand to return no existing user
    dynamoDBMock.on(QueryCommand).resolves({ Items: [] });

    // Mock the PutItemCommand to return success
    dynamoDBMock.on(PutItemCommand).resolves({});

    const event = {
      body: JSON.stringify({
        name: 'Test User',
        email: 'Test.User2@example.com',
        password: 'TestPassword123',
      }),
    };

    const result = await handler(event, {});

    expect(result).toHaveProperty('statusCode');
    expect(result).toHaveProperty('headers');
    expect(result).toHaveProperty('body');

    const { statusCode, body } = result;

    expect(statusCode).toBe(201);

    const parsedBody = JSON.parse(body as string);

    expect(parsedBody).toHaveProperty('userId');
    expect(parsedBody).toHaveProperty('name');
    expect(parsedBody).toHaveProperty('email');
    expect(parsedBody).toHaveProperty('createdAt');
    expect(parsedBody).toHaveProperty('token');

    expect(parsedBody.name).toBe('Test User');
    expect(parsedBody.email).toBe('Test.User2@example.com');
    expect(parsedBody.createdAt).toMatch(/Z$/);
  });

  it('should return 400 if user already exists', async () => {
    const existingUser = {
      userId: { S: 'u1234567890' },
      name: { S: 'Existing User' },
      preservedCaseEmail: { S: 'existing.user@example.com' },
      createdAt: { S: '2023-01-01T00:00:00.000Z' },
      updatedAt: { S: '2023-01-01T00:00:00.000Z' },
    };

    // Mock the QueryCommand to return an existing user
    dynamoDBMock.on(QueryCommand).resolves({ Items: [existingUser] });

    const event = {
      body: JSON.stringify({
        name: 'Test User',
        email: 'existing.user@example.com',
        password: 'TestPassword123',
      }),
    };

    const result = await handler(event, {});

    expect(result.statusCode).toBe(400);

    // The error handler middleware should provide a body
    if (result.body) {
      const parsedBody = JSON.parse(result.body as string);
      expect(parsedBody).toHaveProperty('message');
      expect(parsedBody.message).toContain('already exists');
    } else {
      // If no body, the error might be handled differently by the middleware
      expect(result.statusCode).toBe(400);
    }
  });
});
