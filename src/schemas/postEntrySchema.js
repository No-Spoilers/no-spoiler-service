const schema = {
  properties: {
    body: {
      type: 'object',
      properties: {
        seriesId: { type: 'string' },
        bookId: { type: 'string' },
        name: { type: 'string' },
        text: { type: 'string' }
      },
      required: [ 'seriesId', 'bookId', 'name', 'text' ]
    }
  },
  required: [ 'body' ]
};

export default schema;