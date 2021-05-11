import createError from 'http-errors';
import commonMiddleware from '../../lib/commonMiddleware';
import dbGetBookBySeriesIdAndBookId from '../../db/dbGetBookBySeriesIdAndBookId';
import dbCreateEntry from '../../db/dbCreateEntry';
import dbUpdateEntry from '../../db/dbUpdateEntry';

async function postEntryList(event) {
  const {seriesId, bookId, mentions} = event.body;
  const { token } = event;

  if (!token) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'invalid token' }),
    };
  }

  try {
    const book = await dbGetBookBySeriesIdAndBookId(seriesId, bookId);
    if (!book) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: `Book with ID "${bookId}" in "${seriesId}" not found.` }),
      };
    }

    // Split mentions into new (create) and old (update)

    const promiseList = mentions.map(entry => {
      entry.seriesId = seriesId;
      entry.bookId = bookId;

      if (entry.entryId) {
        return dbUpdateEntry(entry, token.sub);
      }

      return dbCreateEntry(entry, token.sub);
    })

    const transactions = await Promise.all(promiseList);

    return {
      statusCode: 200,
      body: JSON.stringify( transactions ),
    };

  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }

}

export const handler = commonMiddleware(postEntryList);
