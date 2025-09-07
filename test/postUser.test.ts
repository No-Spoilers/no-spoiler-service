import { expect } from 'chai';
import {
  DynamoDBClient,
  QueryCommand,
  PutItemCommand,
} from '@aws-sdk/client-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';

import { handler } from '../src/handlers/user/postUser.js';

describe('postUser', () => {
  let dynamoDBMock: any;

  before(() => {
    // Create a global mock that applies to all DynamoDB clients
    dynamoDBMock = mockClient(DynamoDBClient);
  });

  beforeEach(() => {
    // Reset the mock before each test but keep the same instance
    dynamoDBMock.reset();
  });

  after(() => {
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

    expect(result).to.have.all.keys('statusCode', 'headers', 'body');

    const { statusCode, body } = result;

    expect(statusCode).to.equal(201);

    const parsedBody = JSON.parse(body as string);

    expect(parsedBody).to.have.all.keys(
      'userId',
      'name',
      'email',
      'createdAt',
      'token',
    );
    expect(parsedBody.name).to.equal('Test User');
    expect(parsedBody.email).to.equal('Test.User2@example.com');
    expect(parsedBody.createdAt).to.match(/Z$/);
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

    expect(result.statusCode).to.equal(400);
    const parsedBody = JSON.parse(result.body as string);
    expect(parsedBody).to.have.property('message');
    expect(parsedBody.message).to.include('already exists');
  });
});
