import AWS from 'aws-sdk';
import createError from 'http-errors';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export default async function dbQueryUserLevels(userId) {
  try {
    const params = {
      TableName: process.env.NO_SPOILERS_TABLE_NAME,
      KeyConditionExpression: 'primary_key = :primary_key',
      ExpressionAttributeValues: {
        ':primary_key': userId
      }
    };

    const { Items: levelArray } = await dynamodb.query(params).promise();

    const levelsBySeries = levelArray.reduce((acc, entry) => {
      acc[entry.sort_key] = entry.bookId;
      return acc;
    }, {})

    return levelsBySeries;

  } catch (error) {
      console.error(error);
      throw new createError.InternalServerError(error);
  }
}