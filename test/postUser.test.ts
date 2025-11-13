import {
  DynamoDBClient,
  QueryCommand,
  PutItemCommand,
} from '@aws-sdk/client-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import createHttpError from 'http-errors';

import { handler } from '../src/handlers/user/postUser.js';
import { mockEvent, mockContext } from './test-helpers.js';

const NO_ITEM_FOUND_RESPONSE = {
  $metadata: {
    httpStatusCode: 200,
    requestId: 'K6PJ3FPRRUI48CCI6G15SKDD4VVV4KQNSO5AEMVJF66Q9ASUAAJG',
    extendedRequestId: '', // actually came back undefined
    cfId: '', // actually came back undefined
    attempts: 1,
    totalRetryDelay: 0,
  },
  Count: 0,
  Items: [],
  ScannedCount: 0,
};

const ONE_USER_FOUND_RESPONSE = {
  $metadata: {
    httpStatusCode: 200,
    requestId: 'K6PJ3FPRRUI48CCI6G15SKDD4VVV4KQNSO5AEMVJF66Q9ASUAAJG',
    extendedRequestId: '', // actually came back undefined
    cfId: '', // actually came back undefined
    attempts: 1,
    totalRetryDelay: 0,
  },
  Count: 1,
  Items: [
    {
      userId: { S: 'u1234567890' },
      name: { S: 'Existing User' },
      preservedCaseEmail: { S: 'existing.user@example.com' },
      createdAt: { S: '2023-01-01T00:00:00.000Z' },
      updatedAt: { S: '2023-01-01T00:00:00.000Z' },
    },
  ],
  ScannedCount: 1,
};

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
    dynamoDBMock.on(QueryCommand).resolves(NO_ITEM_FOUND_RESPONSE);

    // Mock the PutItemCommand to return success
    dynamoDBMock.on(PutItemCommand).resolves({});

    const event = {
      ...mockEvent,
      body: JSON.stringify({
        name: 'Test User',
        email: 'Test.User2@example.com',
        password: 'TestPassword123',
      }),
    };

    const result = await handler(event, mockContext);

    if (typeof result === 'string') {
      throw new Error('Result is a string');
    }
    expect(result).toHaveProperty('statusCode');
    expect(result).toHaveProperty('body');

    const { statusCode, body } = result;

    expect(statusCode).toBe(201);

    if (typeof body !== 'string') {
      throw new Error('Body is not a string');
    }

    const parsedBody: unknown = JSON.parse(body);

    expect(parsedBody).toEqual({
      userId: expect.any(String) as string,
      name: 'Test User',
      email: 'Test.User2@example.com',
      createdAt: expect.stringMatching(/Z$/) as string,
      token: expect.any(String) as string,
    });
  });

  it('should return 400 if user already exists', async () => {
    // Mock the QueryCommand to return an existing user
    dynamoDBMock.on(QueryCommand).resolves(ONE_USER_FOUND_RESPONSE);

    const event = {
      ...mockEvent,
      body: JSON.stringify({
        name: 'Test User',
        email: 'existing.user@example.com',
        password: 'TestPassword123',
      }),
    };

    const result = await handler(event, mockContext);
    if (!(result instanceof createHttpError.BadRequest)) {
      throw new Error('Result is a string');
    }

    expect(result.statusCode).toBe(400);
    expect(result).toHaveProperty('message');
    expect(result.message).toContain('already exists');
  });
});
