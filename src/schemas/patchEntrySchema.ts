import { JSONSchema7 } from 'json-schema';

export const patchEntrySchema: JSONSchema7 = {
  type: 'object',
  required: ['body'],
  properties: {
    body: {
      type: 'object',
      properties: {
        seriesId: { type: 'string' },
        entryId: { type: 'string' },
        bookId: { type: 'string' },
        text: { type: 'string' },
      },
      required: ['seriesId', 'entryId', 'bookId', 'text'],
    },
  },
};
