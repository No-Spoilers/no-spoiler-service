import AWS from 'aws-sdk';
import createError from 'http-errors';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export default async function dbUpdateSeries(seriesId, seriesData) {
  const now = new Date();

  let updateExpression = 'set updatedAt = :updatedAt';

  const expressionAttributeValues = {
    ':updatedAt': now.toISOString()
  }

  const expressionAttributeNames = {};

  if (seriesData.name) {
    updateExpression += ', #name = :name';
    expressionAttributeValues[':name'] = seriesData.name;
    expressionAttributeNames['#name'] = 'name';
  }

  if (seriesData.text) {
    updateExpression += ', #text = :text';
    expressionAttributeValues[':text'] = seriesData.text;
    expressionAttributeNames['#text'] = 'text';
  }

  const params = {
    TableName: process.env.NO_SPOILERS_TABLE_NAME,
    Key: {
      primary_key: seriesId,
      sort_key: 'TOP~'
    },
    ConditionExpression: 'attribute_exists(sort_key)',
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ExpressionAttributeNames: expressionAttributeNames,
    ReturnValues: 'ALL_NEW'
  };

  try {
    const result = await dynamodb.update(params).promise();

    const series = result.Attributes;

    series.seriesId = series.primary_key;
    delete series.primary_key;
    delete series.sort_key;

    return series;

  } catch (error) {
    if(error && error.code && error.code === 'ConditionalCheckFailedException') {
      return null;
    }
    console.error(error);
    throw new createError.InternalServerError(error);
  }
}