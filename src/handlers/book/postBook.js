import createError from 'http-errors';
import dbCreateBook from '../../lib/dbCreateBook';
import commonMiddleware from '../../lib/commonMiddleware';

async function postBook(event) {
  const { name, seriesId } = event.body;

  if (!name || name === '' || !seriesId || seriesId === '') {
    return {
      statusCode: 400,
      body: JSON.stringify( {error: 'Malformed entry. Missing data.'} ),
    };
  }

  try {

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
