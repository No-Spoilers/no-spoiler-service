import { JSONSchema7 } from 'json-schema';

export const postEntrySchema: JSONSchema7 = {
  type: 'object',
  required: ['body'],
  properties: {
    body: {
      type: 'object',
      properties: {
        seriesId: { type: 'string' },
        bookId: { type: 'string' },
        name: { type: 'string' },
        text: { type: 'string' },
      },
      required: ['seriesId', 'bookId', 'name'],
    },
  },
};
