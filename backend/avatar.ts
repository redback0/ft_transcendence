
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fs from 'fs';

const avatarsRoot = "/database/avatars/";

export function registerAvatars(fastify: FastifyInstance)
{
    fastify.get<{
        Params: { userID: string }
    }>("/api/user/:userID/avatar", getAvatarRoute);
}

function getAvatarRoute(request: FastifyRequest<{ Params: { userID: string }}>, reply: FastifyReply)
{
    const { userID } = request.params;
    let imgPath = avatarsRoot + userID + ".png";

    if (!fs.existsSync(imgPath))
    {
        imgPath = avatarsRoot + "default.png";
    }

    const imgBuffer = fs.readFileSync(imgPath);

    reply.header('content-type', 'image/png').send(imgBuffer);
}