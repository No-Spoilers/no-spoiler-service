import AWS from 'aws-sdk';
import createError from 'http-errors';

export default async function dbQueryUserByEmail(email) {
  const dynamodb = new AWS.DynamoDB.DocumentClient();
  try {
    const normalizedEmail = email.toLowerCase();

    const result = await dynamodb.get({
      TableName: process.env.NO_SPOILERS_TABLE_NAME,
      Key: {
        primary_key: 'user',
        sort_key: normalizedEmail
      }
    }).promise();

    return result.Item;

  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }
}