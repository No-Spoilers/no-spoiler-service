import createError from 'http-errors';
import dbCreateEntry from '../../lib/dbCreateEntry';
import commonMiddleware from '../../lib/commonMiddleware';
import dbQuerySeriesById from '../../lib/dbQuerySeriesById';

async function postEntry(event) {
  const { text, seriesId } = event.body;

  if (!text || text === '' || !seriesId || seriesId === '') {
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

    const newEntry = await dbCreateEntry(text, seriesId);

    return {
      statusCode: 201,
      body: JSON.stringify( newEntry ),
    };

  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }

}

export const handler = commonMiddleware(postEntry);
