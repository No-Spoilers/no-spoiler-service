import { v4 as uuid } from 'uuid';
import AWS from 'aws-sdk';
import createError from 'http-errors';
import commonMiddleware from '../../lib/commonMiddleware';
import dbQuerySeriesById from '../../lib/dbQuerySeriesById';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function postBook(event) {
  console.log(event.pathParameters);
  console.log(event.body);
  const { seriesId, bookData } = event.body;
  const now = new Date();

  if (!seriesId || !bookData) {
    return {
      statusCode: 400,
      body: JSON.stringify( {error: 'Malformed entry. Missing id or data.'} ),
    };
  }

  const series = await dbQuerySeriesById(seriesId);

  if(!series) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `Series with ID "${seriesId}" not found.` }),
    }
  }

  const { books = [] } = series;

  bookData.bookId = uuid();
  bookData.added = now.toISOString();

  books.push(bookData);

  const params = {
    TableName: process.env.SERIES_TABLE_NAME,
    Key: { id: seriesId },
    ConditionExpression: 'attribute_exists(id)',
    UpdateExpression: 'set #books = :books, updatedAt = :updatedAt',
    ExpressionAttributeValues: {
      ':books': books,
      ':updatedAt': now.toISOString()
    },
    ExpressionAttributeNames: {
      '#books': 'books'
    },
    ReturnValues: 'ALL_NEW'
  };

  let updatedSeries;

  try {
    const result = await dynamodb.update(params).promise();

    updatedSeries = result.Attributes;
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 201,
    body: JSON.stringify( updatedSeries ),
  };
}

export const handler = commonMiddleware(postBook);