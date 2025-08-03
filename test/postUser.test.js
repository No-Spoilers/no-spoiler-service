import { expect } from 'chai';
import AWSMock from 'aws-sdk-mock';
import AWS from 'aws-sdk';

import { handler } from '../src/handlers/user/postUser.js';

describe('postUser', () => {

  before(() => {
    // set up a mock call to DynamoDB
    AWSMock.setSDKInstance(AWS);
    AWSMock.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
      const fakeData = {
        Item: {
          foo: 'bar'
        }
      };

      return callback(null, fakeData);
    });
    AWSMock.mock('DynamoDB.DocumentClient', 'get', (params, callback) => {
      const fakeData = { Item: null };

      return callback(null, fakeData);
    });
  });

  after(() => {
    // restore normal function
    AWSMock.restore('DynamoDB.DocumentClient');
  });

  it('should create a new user', async () => {
    const event = {
      body: JSON.stringify({
        name: 'Test User',
        email: 'Test.User@example.com',
        password: 'Test Password'
      })
    }

    const result = await handler(event);
    // const result = {};

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
    expect(parsedBody.email).to.equal('Test.User@example.com');
    expect(parsedBody.createdAt).to.match(/Z$/);
  });
});
