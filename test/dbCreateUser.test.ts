import {
  DynamoDBClient,
  QueryCommand,
  PutItemCommand,
} from '@aws-sdk/client-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';

import { dbCreateUser } from '../src/handlers/user/postUser.js';

describe('dbCreateUser', () => {
  const dynamoDBMock = mockClient(DynamoDBClient);

  beforeEach(() => {
    // Reset the mock before each test but keep the same instance
    dynamoDBMock.reset();
  });

  afterEach(() => {
    dynamoDBMock.restore();
  });

  it('should create a new user in the database', async () => {
    // Mock the QueryCommand to return no existing user
    dynamoDBMock.on(QueryCommand).resolves({ Items: [] });

    // Mock the PutItemCommand to return success
    dynamoDBMock.on(PutItemCommand).resolves({});

    const name = 'Test User';
    const preservedCaseEmail = 'Test.User1@example.com';
    const password = 'Test Password';

    const result = await dbCreateUser(name, preservedCaseEmail, password);

    // Verify the result has the expected structure
    expect(result).toHaveProperty('createdAt');
    expect(result).toHaveProperty('email');
    expect(result).toHaveProperty('name');
    expect(result).toHaveProperty('updatedAt');
    expect(result).toHaveProperty('userId');

    expect(result.name).toEqual('Test User');
    expect(result.userId).toMatch(/^u/);
    expect(result.email).toEqual('Test.User1@example.com');
    expect(result.createdAt).toMatch(/Z$/);
    expect(result.updatedAt).toMatch(/Z$/);

    // Verify the result doesn't contain internal fields
    expect(result).not.toHaveProperty('primary_key');
    expect(result).not.toHaveProperty('sort_key');
    expect(result).not.toHaveProperty('preservedCaseEmail');
    expect(result).not.toHaveProperty('passwordHash');
  });

  it('should throw an error if user with email already exists', async () => {
    const existingUser = {
      userId: { S: 'u1234567890' },
      name: { S: 'Existing User' },
      preservedCaseEmail: { S: 'existing.user@example.com' },
      createdAt: { S: '2023-01-01T00:00:00.000Z' },
      updatedAt: { S: '2023-01-01T00:00:00.000Z' },
    };

    // Mock the QueryCommand to return an existing user
    dynamoDBMock.on(QueryCommand).resolves({ Items: [existingUser] });

    const name = 'Existing User';
    const preservedCaseEmail = 'existing.user@example.com';
    const password = 'Test Password';

    await expect(
      dbCreateUser(name, preservedCaseEmail, password),
    ).rejects.toThrow('User already exists');
  });
});
