const schema = {
  type: 'object',
  required: [ 'body' ],
  properties: {
    body: {
      type: 'object',
      required: [ 'name' ],
      properties: {
        name: { type: 'string' }
      }
    }
  }
};

export default schema;