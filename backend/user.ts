//Authored by Bethany Milford 18/07/2025
import fastify, { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { appendFile } from "fs";
import { createUserSession } from "./cookie";
import { db } from "./server"; 
import { request } from "http";

async function registerRoutes(fastify: FastifyInstance)
{
    fastify.post('/api/login', { schema: postSignUp }, SignUpUser);
    fastify.get('/api/login', { schema: getLogin },  LoginUser);
} 
export default registerRoutes;

const postSignUp = {
    body: {
        type: 'object',
        required: ['username','hashedPassword'],
        properties: {
            username: { type: 'string'},
            hashedPassword: { type: 'string'},
        },
    },
};
const getLogin = {
    body: {
        type: 'object',
        required: ['username', 'hashedPassword'],
        properties: {
            username: { type: 'string'},
            hashedPassword: { type: 'string'},
        },
        additionalProperties: false
    },
}

async function SignUpUser(request: FastifyRequest, reply: FastifyReply)
 {
    try {
        const { username, hashedPassword = true } = request.body;
        //search database for existing username
        // if yes, return error -> user already taken
        //if no insert into database
        const post = await db.run('INSERT INTO users(username, hashedPassword) VALUES()'); // the sql commmands
        reply.code(200).send(post);
        //if successfull, load new home page with index that include my profile, my chat -> done in the front end
    }
    catch (error) {
        request.log.error('Error unable to creare account', error);
        reply.send({error: 'Failed to create account'});
    }
}  
// need to add the sql database commands everywhere
async function LoginUser(request: FastifyRequest, reply: FastifyReply)
{
    try {
        const where = {};
        if (request.query)
    // search database for identical username and hashed password
    // if yes load new home page
    // if no return error, incorrect username or password
    }
}

