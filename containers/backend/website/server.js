// Require the framework and instantiate it
const fastify = require('fastify')({ logger: true })
const fs = require('fs')

// Declare a route
fastify.get('/', function handler (request, reply) {
  const stream = fs.createReadStream(resolvePath('index.html'))
  reply.type('text/html').send(stream)
})

// Run the server!
fastify.listen({ port: 3000, host: '0.0.0.0' }, (err) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})

process.on('SIGINT', () => {
  process.exit(0);
})

process.on('SIGTERM', () => {
  process.exit(0);
})
