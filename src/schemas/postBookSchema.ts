import { JSONSchema7 } from 'json-schema';

const schema: JSONSchema7 = {
  type: 'object',
  required: ['body'],
  properties: {
    body: {
      type: 'object',
      properties: {
        seriesId: { type: 'string' },
        name: { type: 'string' },
        pubDate: { type: 'string' }
      },
      required: ['seriesId', 'name', 'pubDate']
    }
  }
};

export default schema;
