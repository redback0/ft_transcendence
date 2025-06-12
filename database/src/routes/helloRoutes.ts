// import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
// import { helloWorldController1, helloWorldController2, helloWorldController3,  } from "../controller/helloController";


// export const mainRoutes = (app: FastifyInstance) => {
//     app.get('/', helloWorldController1);

//     app.get<{Params: { id: number }}>('/hello/:id', { handler: helloWorldController2 });

//     app.get<{ Querystring: { test: string} }>('/world', {
//         schema: {
//             querystring: {
//                 type: "object", 
//                 properties: {
//                     test: {type: "string" }
//                 },
//                 required: ["test"]
//             }
//         },
//         handler: helloWorldController3 }
//     );

//     app.setErrorHandler(( error: Error, req: FastifyRequest, res: FastifyReply ) => {
//         console.error(error);

//         return res.status(409).send({ok: false});
//     })
// }