import createError from 'http-errors';
import { getDbItem } from '../lib/dynamodb-client.js';

export default async function dbGetBookBySeriesIdAndBookId(seriesId, bookId) {
  try {
    const book = await getDbItem(seriesId, bookId);

    if (!book) return null;

    book.seriesId = book.primary_key,
    book.bookId = book.sort_key,
    delete book.primary_key,
    delete book.sort_key

    return book;

  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }
}
