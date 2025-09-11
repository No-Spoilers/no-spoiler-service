import { expect } from 'chai';
import {
  DynamoDBClient,
  QueryCommand,
  PutItemCommand,
} from '@aws-sdk/client-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';

import { dbCreateUser } from '../src/db/dbCreateUser.js';

describe('dbCreateUser', () => {
  const dynamoDBMock = mockClient(DynamoDBClient);

  beforeEach(() => {
    // Reset the mock before each test but keep the same instance
    dynamoDBMock.reset();
  });

  after(() => {
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
    expect(result).to.have.all.keys([
      'createdAt',
      'email',
      'name',
      'updatedAt',
      'userId',
    ]);

    expect(result.name).to.equal('Test User');
    expect(result.userId).to.match(/^u/);
    expect(result.email).to.equal('Test.User1@example.com');
    expect(result.createdAt).to.match(/Z$/);
    expect(result.updatedAt).to.match(/Z$/);

    // Verify the result doesn't contain internal fields
    expect(result).to.not.have.property('primary_key');
    expect(result).to.not.have.property('sort_key');
    expect(result).to.not.have.property('preservedCaseEmail');
    expect(result).to.not.have.property('passwordHash');
  });

  it('should return existing user if email already exists', async () => {
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

    const result = await dbCreateUser(name, preservedCaseEmail, password);

    // Verify the result has the 'existing' flag
    expect(result).to.have.property('existing', true);
  });
});
