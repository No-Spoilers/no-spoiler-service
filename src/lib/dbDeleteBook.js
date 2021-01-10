import AWS from 'aws-sdk';
import createError from 'http-errors';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export default async function dbDeleteItem(primary_key, sort_key) {
  try {
    const params = {
      TableName: process.env.NO_SPOILERS_TABLE_NAME,
      Key: {
        primary_key,
        sort_key
      },
      ConditionExpression: 'attribute_exists(sort_key)',
      ReturnValues: 'ALL_OLD'
    };

    const result = await dynamodb.delete(params).promise();

    return result.Attributes;

  } catch (error) {
    if(error && error.code && error.code === 'ConditionalCheckFailedException') {
      return null;
    }

    console.error(error);
    throw new createError.InternalServerError(error);
  }
}