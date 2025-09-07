import commonMiddleware, { HandlerEvent, HandlerResponse } from '../../lib/commonMiddleware.js';
import dbDeleteItem from '../../db/dbDeleteItem.js';
import { AttributeValue } from '@aws-sdk/client-dynamodb';

interface PathParameters {
  contentId: string;
  [key: string]: string;
}

interface DeleteSeriesEvent extends HandlerEvent {
  pathParameters: PathParameters;
}

interface DeletedSeriesResponse {
  seriesId: string;
  [key: string]: unknown;
}

async function deleteSeries(event: DeleteSeriesEvent): Promise<HandlerResponse> {
  const { contentId } = event.pathParameters;

  const deletedSeries = await dbDeleteItem(contentId, 'TOP~');

  if (!deletedSeries) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `Series with ID "${contentId}" not found.` }),
    };
  }

  const responseSeries: DeletedSeriesResponse = {
    seriesId: extractStringValue(deletedSeries.primary_key)
  };

  // Copy other properties
  Object.entries(deletedSeries).forEach(([key, value]) => {
    if (key !== 'primary_key' && key !== 'sort_key') {
      responseSeries[key] = value;
    }
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'item successfully deleted', deletedSeries: responseSeries }),
  };
}

function extractStringValue(attrValue: AttributeValue | undefined): string {
  if (attrValue && 'S' in attrValue) {
    return attrValue.S || '';
  }
  return '';
}

export const handler = commonMiddleware(deleteSeries);
