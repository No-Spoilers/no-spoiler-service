import { expect } from 'chai';
import AWSMock from 'aws-sdk-mock';
import AWS from 'aws-sdk';

import dbCreateSeries from '../src/db/dbCreateSeries.js';

describe('dbCreateSeries', () => {

  before(() => {
    // set up a mock call to DynamoDB
    AWSMock.setSDKInstance(AWS);
    AWSMock.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
      // return fake data
      const fakeData = {
        Item: {
          foo: 'bar'
        }
      };

      return callback(null, fakeData);
    });
  });

  after(() => {
    // restore normal function
    AWSMock.restore('DynamoDB.DocumentClient');
  });

  it('should create a new series', async () => {
    const seriesData = {
      name: 'test name',
      text: 'test text'
    };
    const token = { sub: 'test_createdBy' }

    const result = await dbCreateSeries(seriesData, token);

    expect(result).to.have.all.keys(
      'name',
      'text',
      'createdBy',
      'createdAt',
      'updatedAt',
      'seriesId'
    );
    expect(result.name).to.equal('test name');
    expect(result.text).to.equal('test text');
    expect(result.createdBy).to.equal('test_createdBy');
    expect(result.seriesId).to.match(/^t/);
    expect(result.createdAt).to.match(/Z$/);
    expect(result.updatedAt).to.match(/Z$/);
  });
});
