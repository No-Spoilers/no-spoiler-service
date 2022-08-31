import { expect } from 'chai';
import AWSMock from 'aws-sdk-mock';
import AWS from 'aws-sdk';

import dbCreateUser from '../src/db/dbCreateUser.js';

describe('dbCreateUser', () => {

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

  it('should create a new series', async () => {
    const name = 'Test User';
    const preservedCaseEmail = 'Test.User@example.com';
    const password = 'Test Password'

    const result = await dbCreateUser(name, preservedCaseEmail, password);

    expect(result).to.have.all.keys(
      'name',
      'userId',
      'email',
      'createdAt',
      'updatedAt'
    );
    expect(result.name).to.equal('Test User');
    expect(result.userId).to.match(/^u/);
    expect(result.email).to.equal('Test.User@example.com');
    expect(result.createdAt).to.match(/Z$/);
    expect(result.updatedAt).to.match(/Z$/);
  });
});
