//Authored by Bethany Milford 29/08/2025

/*import fastify, { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { db } from "./database";

export const getUserInfo = async (request: FastifyRequest, response: FastifyReply ) => {
    try {
        const userId = request.params.id;
        const user = await getUserIdFromDatabase(userId);
        if (user)
        {
            response.json(user);
        }
        else
        {
            response.status(404).send('User not found');
        }
    }
    catch (error) {
        response.status(500).send('Server error';)
    }
};

export const getUserIdFromDatabase(userId: string)
{

}*/