import { expect } from 'chai';
import { DynamoDBClient, QueryCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';

import dbCreateUser from '../src/db/dbCreateUser.js';

describe('dbCreateUser', () => {
  let dynamoDBMock;

  beforeEach(() => {
    const dynamoDB = new DynamoDBClient({});
    dynamoDBMock = mockClient(dynamoDB);
  });

  afterEach(() => {
    dynamoDBMock.reset();
  });

  it('should create a new user in the database', async () => {
    dynamoDBMock
      .on(QueryCommand)
      .resolves({ Item: null });
    dynamoDBMock
      .on(PutItemCommand)
      .resolves({ Item: { foo: 'bar' } });

    const name = 'Test User';
    const preservedCaseEmail = 'Test.User1@example.com';
    const password = 'Test Password'

    const result = await dbCreateUser(name, preservedCaseEmail, password);

    expect(result).to.have.all.keys(
      'createdAt',
      'email',
      // 'existing',
      'name',
      'updatedAt',
      'userId',
    );
    expect(result.name).to.equal('Test User');
    expect(result.userId).to.match(/^u/);
    expect(result.email).to.equal('Test.User1@example.com');
    expect(result.createdAt).to.match(/Z$/);
    expect(result.updatedAt).to.match(/Z$/);
  });
});
