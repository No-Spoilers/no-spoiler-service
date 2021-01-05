import AWS from 'aws-sdk';
import createError from 'http-errors';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export default async function dbDeleteBook(bookId) {
  try {
    const params = {
      TableName: process.env.BOOK_TABLE_NAME,
      Key: { id: bookId },
      ConditionExpression: 'attribute_exists(id)',
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