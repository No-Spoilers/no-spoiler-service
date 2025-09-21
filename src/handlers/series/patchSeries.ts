import type { AttributeValue } from '@aws-sdk/client-dynamodb';
import type { AuthLambdaEvent } from '../../lib/commonMiddleware.js';

import { extractStringValue, internalServerError } from '../../lib/utils.js';
import { updateDbItem } from '../../lib/dynamodb-client.js';
import { commonMiddleware } from '../../lib/commonMiddleware.js';

interface SeriesUpdateData {
  name?: string;
  text?: string;
  [key: string]: unknown;
}

interface SeriesResponse {
  seriesId: string;
  name?: string;
  text?: string;
  updatedAt: string;
}

interface PathParameters {
  contentId: string;
  [key: string]: string;
}

interface PatchSeriesEvent extends AuthLambdaEvent {
  pathParameters: PathParameters;
  body: SeriesUpdateData;
}

export const handler = commonMiddleware(patchSeries);

async function patchSeries(event: PatchSeriesEvent) {
  const { contentId } = event.pathParameters;
  const seriesData = event.body;

  const updatedSeries = await dbUpdateSeries(contentId, seriesData);

  if (!updatedSeries) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `series:${contentId} not found` }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'item successfully updated',
      updatedSeries,
    }),
  };
}

export async function dbUpdateSeries(
  seriesId: string,
  seriesData: SeriesUpdateData,
): Promise<SeriesResponse | null> {
  try {
    const now = new Date();

    let updateExpression = 'set updatedAt = :updatedAt';

    const expressionAttributeValues: Record<string, AttributeValue> = {
      ':updatedAt': { S: now.toISOString() },
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
        sort_key: { S: 'TOP~' },
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
      updatedAt: extractStringValue(series.updatedAt),
    };

    return seriesResponse;
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'ConditionalCheckFailedException'
    ) {
      return null;
    }
    throw internalServerError(error);
  }
}
