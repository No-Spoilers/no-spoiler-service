import AWS from 'aws-sdk';
import createError from 'http-errors';
import generateId from '../lib/base64id.js';

const dynamodb = new AWS.DynamoDB();

// Saved for reference. This works, but does not provide any feedback, so I'm not using it.
export default async function dbUpdateMultipleEntries(entryList, userId) {
  try {

    const TransactItems = entryList.mentions.map(entry => {
      const sortKey = entry.entryId || `e${generateId(9)}`;
      const now = new Date();

      return {
        Update: {
          TableName: process.env.NO_SPOILERS_TABLE_NAME,
          Key: {
            primary_key: { S: entryList.seriesId },
            sort_key: { S: sortKey }
          },
          UpdateExpression: 'set updatedAt = :updatedAt, updatedBy = :updatedBy, #bookId = :bookId, #name = :name',
          ExpressionAttributeNames: {
            '#bookId': 'bookId',
            '#name': 'name'
          },
          ExpressionAttributeValues: {
            ':updatedAt': { S: now.toISOString() },
            ':updatedBy': { S: userId },
            ':bookId': { S: entryList.bookId },
            ':name': { S: entry.name }
          },
        }
      }
    });

    const params = {
      TransactItems
    };

    const result = await dynamodb.transactWriteItems(params).promise();

    return result;

  } catch (error) {
    if(error && error.code && error.code === 'ConditionalCheckFailedException') {
      return null;
    }
    console.error(error);
    throw new createError.InternalServerError(error);
  }
}