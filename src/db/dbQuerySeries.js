import AWS from 'aws-sdk';
import createError from 'http-errors';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export default async function dbQuerySeries() {
  const params = {
    TableName: process.env.NO_SPOILERS_TABLE_NAME,
    KeyConditionExpression: '#pk = :top',
    ExpressionAttributeNames:{
        '#pk': 'primary_key'
    },
    ExpressionAttributeValues: {
        ':top': 'TOP~'
    }
  };

  try {
    const result = await dynamodb.query(params).promise();

    result.Items.forEach(series => {
      series.seriesId = series.sort_key,
      delete series.primary_key,
      delete series.sort_key
    })

    return result.Items;

  } catch (error) {
      console.error(error);
      throw new createError.InternalServerError(error);
  }
}