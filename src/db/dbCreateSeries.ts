import { generateId } from '../lib/base64id.js';
import { putDbItem } from '../lib/dynamodb-client.js';

interface SeriesData {
  name: string;
  text: string;
  [key: string]: unknown;
}

interface TokenData {
  sub: string;
  [key: string]: unknown;
}

interface SeriesRecord {
  primary_key: string;
  sort_key: string;
  name: string;
  text: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

interface SeriesResponse {
  seriesId: string;
  name: string;
  text: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export async function dbCreateSeries(
  seriesData: SeriesData,
  token: TokenData,
): Promise<SeriesResponse> {
  const now = new Date().toISOString();

  const series: SeriesRecord = {
    primary_key: `t${generateId(10)}`,
    sort_key: 'TOP~',
    name: seriesData.name,
    text: seriesData.text,
    createdBy: token.sub,
    createdAt: now,
    updatedAt: now,
  };

  await putDbItem(series);

  const seriesResponse: SeriesResponse = {
    seriesId: series.primary_key,
    name: series.name,
    text: series.text,
    createdBy: series.createdBy,
    createdAt: series.createdAt,
    updatedAt: series.updatedAt,
  };

  return seriesResponse;
}
