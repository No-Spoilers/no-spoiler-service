const schema = {
  properties: {
    body: {
      type: 'object',
      properties: {
        seriesId: { type: 'string' },
        name: { type: 'string' },
        pubDate: { type: 'string' }
      },
      required: [ 'seriesId', 'name', 'pubDate' ]
    }
  },
  required: [ 'body' ]
};

export default schema;