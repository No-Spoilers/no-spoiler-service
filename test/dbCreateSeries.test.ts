import { expect } from 'chai';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';

import dbCreateSeries from '../src/db/dbCreateSeries.js';

describe('dbCreateSeries', () => {
  let dynamoDBMock: any;

  beforeEach(() => {
    const dynamoDB = new DynamoDBClient({});
    dynamoDBMock = mockClient(dynamoDB);
  });

  afterEach(() => {
    dynamoDBMock.reset();
  });

  it('should create a new series', async () => {
    dynamoDBMock
      .on(PutItemCommand)
      .resolves({ Item: { foo: 'bar' } });

    const seriesData = {
      name: 'test name',
      text: 'test text'
    };
    const token = { sub: 'test_createdBy' };

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
