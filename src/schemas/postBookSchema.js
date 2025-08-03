const schema = {
  type: 'object',
  required: [ 'body' ],
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
  }
};

export default schema;