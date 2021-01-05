import createError from 'http-errors';
import dbCreateBook from '../../lib/dbCreateBook';
import commonMiddleware from '../../lib/commonMiddleware';
import dbQuerySeriesById from '../../lib/dbQuerySeriesById';

async function postBook(event) {
  const { name, seriesId } = event.body;

  if (!name || name === '' || !seriesId || seriesId === '') {
    return {
      statusCode: 400,
      body: JSON.stringify( {error: 'Malformed entry. Missing data.'} ),
    };
  }

  try {
    const series = await dbQuerySeriesById(seriesId);
    if (!series) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: `Series with ID "${seriesId}" not found.` }),
      };
    }

    const newBook = await dbCreateBook(name, seriesId);

    return {
      statusCode: 201,
      body: JSON.stringify( newBook ),
    };

  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }

}

export const handler = commonMiddleware(postBook);
