import generateId from '../lib/base64id.js';
import { putDbItem } from '../lib/dynamodb-client.js';

export default async function dbCreateSeries(seriesData, token) {
  const now = new Date().toISOString();

  const series = {
    primary_key: `t${generateId(10)}`,
    sort_key: 'TOP~',
    name: seriesData.name,
    text: seriesData.text,
    createdBy: token.sub,
    createdAt: now,
    updatedAt: now
  };


  await putDbItem(series);

  series.seriesId = series.primary_key;
  delete series.primary_key;
  delete series.sort_key;

  return series;
}
