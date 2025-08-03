import createError from 'http-errors';
import { updateDbItem } from '../lib/dynamodb-client';

export default async function dbUpdateBook(bookData, token) {
  try {
    const { seriesId, bookId } = bookData;
    const now = new Date();
    if (bookData.pubDate) {
      bookData.pubDate = new Date(bookData.pubDate).toISOString();
    }

    let updateExpression = 'set updatedAt = :updatedAt, updatedBy=:updatedBy';

    const expressionAttributeValues = {
      ':updatedAt': now.toISOString(),
      ':updatedBy': token.sub
    }

    const expressionAttributeNames = {};

    const validFields = ['name', 'text', 'pubDate'];

    validFields.forEach(field => {
      if (bookData[field]) {
        updateExpression += `, #${field} = :${field}`;
        expressionAttributeNames[`#${field}`] = `${field}`;
        expressionAttributeValues[`:${field}`] = bookData[field];
      }
    })

    const params = {
      Key:{
        primary_key: seriesId,
        sort_key: bookId,
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    };

    const book = await updateDbItem(params);

    book.seriesId = book.primary_key;
    book.bookId = book.sort_key;
    delete book.primary_key;
    delete book.sort_key;

    return book;

  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }
}