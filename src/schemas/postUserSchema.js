const schema = {
  properties: {
    body: {
      type: 'object',
      properties: {
        name: { type: 'string' }
      },
      required: [ 'name' ]
    }
  },
  required: [ 'body' ]
};

export default schema;