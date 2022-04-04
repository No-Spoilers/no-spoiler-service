import AWS from 'aws-sdk';
import createError from 'http-errors';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export default async function dbUpdateEntry(entry, newEntry, userId) {
  try {
    const now = new Date();

    const newText = {
      ...entry.text,
      [`${newEntry.bookId}`]: newEntry.text
    };

    const params = {
      TableName: process.env.NO_SPOILERS_TABLE_NAME,
      Key: {
        primary_key: entry.seriesId,
        sort_key: entry.entryId
      },
      UpdateExpression: 'set updatedAt=:updatedAt, updatedBy=:updatedBy, #text=:text',
      ExpressionAttributeNames: {
        '#text': 'text'
      },
      ExpressionAttributeValues: {
        ':updatedAt': now.toISOString(),
        ':updatedBy': userId,
        ':text': newText
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