// import { FastifyReply, FastifyRequest } from "fastify";

// export const helloWorldController1 = (req: FastifyRequest, res: FastifyReply) => {
//     throw new Error("Test error");
//     return ({hello: 'world'})
// };

// export const helloWorldController2 = (req: FastifyRequest<{Params: { id: number }}>, res: FastifyReply) => {
//     const params = req.params;

//     return ({hello: params.id})
// };

// export const helloWorldController3 = (req: FastifyRequest<{Querystring: { test: string }}>, res: FastifyReply) => {
//     const test = req.query.test;
//     return res.status(300).send(test);
// };