import createError from 'http-errors';
import commonMiddleware from '../../lib/commonMiddleware';
import dbCreateSeries from '../../lib/dbCreateSeries';

async function postSeries(event) {
  const { name } = event.body;

  try {
    const series = await dbCreateSeries(name);

    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'new item successfully added', series }),
    };
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }
}

export const handler = commonMiddleware(postSeries);
