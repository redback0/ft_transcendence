import Fastify, { FastifyInstance, RouteShorthandOptions } from 'fastify'

const fastify: FastifyInstance = Fastify({})

// Declare a route
fastify.get('/', function handler (request, reply) {
  reply.send("Hello world")
})

// Run the fastify!
const start = async () => {
  try {
    await fastify.listen({ port: 3000 })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
