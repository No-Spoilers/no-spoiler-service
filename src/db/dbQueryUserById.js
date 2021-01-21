import AWS from 'aws-sdk';
import createError from 'http-errors';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export default async function dbQueryUserById(userId) {
  try {
    const result = await dynamodb.get({
      TableName: process.env.NO_SPOILERS_TABLE_NAME,
      Key: {
        primary_key: 'user',
        sort_key: userId
      }
    }).promise();

    return result.Item;
  } catch (error) {
      console.error(error);
      throw new createError.InternalServerError(error);
  }
}