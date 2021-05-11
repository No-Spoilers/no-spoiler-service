import AWS from 'aws-sdk';
import createError from 'http-errors';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export default async function dbUpdateEntry(entry, userId) {
  try {
    const now = new Date();

    const params = {
      TableName: process.env.NO_SPOILERS_TABLE_NAME,
      Key: {
        primary_key: entry.seriesId,
        sort_key: entry.entryId
      },
      UpdateExpression: 'set updatedAt=:updatedAt, updatedBy=:updatedBy, bookId=:bookId, #name=:name',
      ExpressionAttributeNames: {
        '#name': 'name'
      },
      ExpressionAttributeValues: {
        ':updatedAt': now.toISOString(),
        ':updatedBy': userId,
        ':bookId': entry.bookId,
        ':name': entry.name
      },
      ReturnValues: 'ALL_NEW'
    };

    const { Attributes: result } = await dynamodb.update(params).promise();

    result.seriesId = result.primary_key;
    result.entryId = result.sort_key;
    delete result.primary_key;
    delete result.sort_key;

    return result;

  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }
}