import { JSONSchema7 } from 'json-schema';

export const postSeriesSchema: JSONSchema7 = {
  type: 'object',
  required: ['body'],
  properties: {
    body: {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string' },
      },
    },
  },
};
