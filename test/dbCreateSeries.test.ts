import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';

import { dbCreateSeries } from '../src/handlers/series/postSeries.js';

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

    expect(result).toHaveProperty('name');
    expect(result).toHaveProperty('text');
    expect(result).toHaveProperty('createdBy');
    expect(result).toHaveProperty('createdAt');
    expect(result).toHaveProperty('updatedAt');
    expect(result).toHaveProperty('seriesId');

    expect(result.name).toEqual('test name');
    expect(result.text).toEqual('test text');
    expect(result.createdBy).toEqual('test_createdBy');
    expect(result.seriesId).toMatch(/^t/);
    expect(result.createdAt).toMatch(/Z$/);
    expect(result.updatedAt).toMatch(/Z$/);
    dynamoDBMock.reset();
  });
});
