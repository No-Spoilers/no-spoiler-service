import { expect } from 'chai';
import { DynamoDBClient, QueryCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';

import { handler } from '../src/handlers/user/postUser.js';

describe('postUser', () => {
  let dynamoDBMock;

  beforeEach(() => {
    const dynamoDB = new DynamoDBClient({});
    dynamoDBMock = mockClient(dynamoDB);
  });

  afterEach(() => {
    dynamoDBMock.reset();
  });

  it('should call the database to create a new user', async () => {
    dynamoDBMock
      .on(QueryCommand)
      .resolves({ Item: null });
    dynamoDBMock
      .on(PutItemCommand)
      .resolves({ Item: { foo: 'bar' } });

    const event = {
      body: JSON.stringify({
        name: 'Test User',
        email: 'Test.User2@example.com',
        password: 'Test Password'
      })
    }

    const result = await handler(event);

    expect(result).to.have.all.keys(
      'statusCode',
      'headers',
      'body'
    );

    const { statusCode, body } = result;

    expect(statusCode).to.equal(201);

    const parsedBody = JSON.parse(body);

    expect(parsedBody).to.have.all.keys(
      'name',
      'email',
      'createdAt',
      'token'
    );
    expect(parsedBody.name).to.equal('Test User');
    expect(parsedBody.email).to.equal('Test.User2@example.com');
    expect(parsedBody.createdAt).to.match(/Z$/);
  });
});
