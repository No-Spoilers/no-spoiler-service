const schema = {
  type: 'object',
  required: [ 'body' ],
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
  }
};

export default schema;