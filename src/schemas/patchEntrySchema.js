const schema = {
  properties: {
    body: {
      type: 'object',
      properties: {
        seriesId: { type: 'string' },
        entryId: { type: 'string' },
        bookId: { type: 'string' },
        text: { type: 'string' }
      },
      required: [ 'seriesId', 'entryId', 'bookId', 'text' ]
    }
  },
  required: [ 'body' ]
};

export default schema;