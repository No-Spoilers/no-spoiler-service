import AWS from 'aws-sdk';
import commonMiddleware from '../../lib/commonMiddleware';
import createError from 'http-errors';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export async function dbQuerySeriesById(seriesId) {
    let series;

    try {
        const result = await dynamodb.get({
            TableName: process.env.SERIES_TABLE_NAME,
            Key: { id: seriesId }
        }).promise();

        series = result.Item;
    } catch (error) {
        console.error(error);
        throw new createError.InternalServerError(error);
    }

    if (!series) {
        throw new createError.NotFound(`Series with ID "${seriesId}" not found.`);
    }

    return series;
}

async function getSeriesById(event) {
    const { seriesId } = event.pathParameters;
    console.log('seriesId', seriesId);

    const series = await dbQuerySeriesById(seriesId);

    return {
        statusCode: 200,
        body: JSON.stringify({ series }),
    };
}

export const handler = commonMiddleware(getSeriesById);
