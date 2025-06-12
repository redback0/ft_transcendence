import Fastify from 'fastify'
// import { mainRoutes } from './routes/helloRoutes';

const app = Fastify({ logger: true });

const start = async () => {
    // mainRoutes(app);
    await app.listen({ port: 10000, host: '127.0.0.1' });
};

start();