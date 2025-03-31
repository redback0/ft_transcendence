import Fastify, { FastifyInstance, RouteShorthandOptions } from 'fastify'

const fastify: FastifyInstance = Fastify({})

// Declare a route
fastify.get('/', function handler (request, reply) {
  reply.send("Hello world")
})

fastify.get('/api/buttonpressed', function handler (request, reply) {
  reply.send({ text: "server response!!" })
})

// Run the fastify!
const start = async () => {
  try {
    fastify.log.info("now listening...")
    await fastify.listen({ port: 3000, host: '0.0.0.0' })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

process.on('SIGINT', () => {

  process.exit(0);

})

process.on('SIGTERM', () => {

  process.exit(0);

})

start()
