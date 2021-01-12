import validator from '@middy/validator';
import postEntrySchema from '../../schemas/postEntrySchema';
import createError from 'http-errors';
import dbCreateEntry from '../../db/dbCreateEntry';
import commonMiddleware from '../../lib/commonMiddleware';
import dbQuerySeriesById from '../../db/dbQuerySeriesById';

async function postEntry(event) {
  const { text, seriesId } = event.body;


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

export const handler = commonMiddleware(postEntry)
  .use(validator({inputSchema: postEntrySchema, useDefaults: true}));
