import AWS from 'aws-sdk';
import createError from 'http-errors';

const dynamodb = new AWS.DynamoDB.DocumentClient();

// Currently only works for updating 'name' but might need to be broadened
export default async function dbUpdateSeries(seriesId, name) {
  const now = new Date();

  const params = {
    TableName: process.env.NO_SPOILERS_TABLE_NAME,
    Key: {
      primary_key: 'TOP~',
      sort_key: seriesId
    },
    ConditionExpression: 'attribute_exists(sort_key)',
    UpdateExpression: 'set #name = :name, updatedAt = :updatedAt',
    ExpressionAttributeValues: {
      ':name': name,
      ':updatedAt': now.toISOString()
    },
    ExpressionAttributeNames: {
      '#name': 'name'
    },
    ReturnValues: 'ALL_NEW'
  };

  try {
    const result = await dynamodb.update(params).promise();

    return result.Attributes;

  } catch (error) {
    if(error && error.code && error.code === 'ConditionalCheckFailedException') {
      return null;
    }
    console.error(error);
    throw new createError.InternalServerError(error);
  }
}