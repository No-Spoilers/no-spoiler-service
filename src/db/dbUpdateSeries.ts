import createError from 'http-errors';
import { updateDbItem } from '../lib/dynamodb-client.js';
import { AttributeValue } from '@aws-sdk/client-dynamodb';

interface SeriesUpdateData {
  name?: string;
  text?: string;
  [key: string]: unknown;
}

interface SeriesRecord {
  primary_key: string;
  sort_key: string;
  name?: string;
  text?: string;
  updatedAt: string;
  [key: string]: unknown;
}

interface SeriesResponse {
  seriesId: string;
  name?: string;
  text?: string;
  updatedAt: string;
}

export default async function dbUpdateSeries(seriesId: string, seriesData: SeriesUpdateData): Promise<SeriesResponse | null> {
  try {
    const now = new Date();

    let updateExpression = 'set updatedAt = :updatedAt';

    const expressionAttributeValues: Record<string, AttributeValue> = {
      ':updatedAt': { S: now.toISOString() }
    };

    const expressionAttributeNames: Record<string, string> = {};

    if (seriesData.name) {
      updateExpression += ', #name = :name';
      expressionAttributeValues[':name'] = { S: seriesData.name };
      expressionAttributeNames['#name'] = 'name';
    }

    if (seriesData.text) {
      updateExpression += ', #text = :text';
      expressionAttributeValues[':text'] = { S: seriesData.text };
      expressionAttributeNames['#text'] = 'text';
    }

    const params = {
      TableName: process.env.NO_SPOILERS_TABLE_NAME || 'NoSpoilersTable-dev',
      Key: {
        primary_key: { S: seriesId },
        sort_key: { S: 'TOP~' }
      },
      ConditionExpression: 'attribute_exists(sort_key)',
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: expressionAttributeNames,
    };

    const series = await updateDbItem(params);

    if (!series) {
      return null;
    }

    const seriesResponse: SeriesResponse = {
      seriesId: extractStringValue(series.primary_key),
      name: extractStringValue(series.name),
      text: extractStringValue(series.text),
      updatedAt: extractStringValue(series.updatedAt)
    };

    return seriesResponse;

  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ConditionalCheckFailedException') {
      return null;
    }
    console.error(error);
    throw new createError.InternalServerError(error as string);
  }
}

function extractStringValue(attrValue: AttributeValue | undefined): string {
  if (attrValue && 'S' in attrValue) {
    return attrValue.S || '';
  }
  return '';
}
