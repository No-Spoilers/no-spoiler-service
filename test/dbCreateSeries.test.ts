import { expect } from 'chai';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';

import { dbCreateSeries } from '../src/db/dbCreateSeries.js';

describe('dbCreateSeries', () => {
  it('should create a new series', async () => {
    const dynamoDB = new DynamoDBClient({});
    const dynamoDBMock = mockClient(dynamoDB);
    dynamoDBMock.on(PutItemCommand).resolves({
      Attributes: { foo: { S: 'bar' } },
    });

    const seriesData = {
      name: 'test name',
      text: 'test text',
    };
    const token = { sub: 'test_createdBy' };

    const result = await dbCreateSeries(seriesData, token);

    expect(result).to.have.all.keys(
      'name',
      'text',
      'createdBy',
      'createdAt',
      'updatedAt',
      'seriesId',
    );
    expect(result.name).to.equal('test name');
    expect(result.text).to.equal('test text');
    expect(result.createdBy).to.equal('test_createdBy');
    expect(result.seriesId).to.match(/^t/);
    expect(result.createdAt).to.match(/Z$/);
    expect(result.updatedAt).to.match(/Z$/);
    dynamoDBMock.reset();
  });
});
