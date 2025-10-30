
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fs from 'fs';
import { SESSION_ID_COOKIE_NAME, validateSession } from "./cookie";
import { pipeline } from "stream";
import { db } from "./database";

const avatarsRoot = "/database/avatars/";

type getAvatar = {
    Params: { userID: string }
};

export function registerAvatars(fastify: FastifyInstance)
{
    fastify.register(import("@fastify/multipart"));

    fastify.get<getAvatar>("/api/user/:userID/avatar", getAvatarRoute);
    fastify.post("/api/user/avatar", postAvatarRoute);
}

function getAvatarRoute(request: FastifyRequest<getAvatar>, reply: FastifyReply)
{
    const { userID } = request.params;
    let imgPath = avatarsRoot + userID + ".png";

    if (!fs.existsSync(imgPath))
    {
        const realUserID = db.getUserIdFromUsername.get(userID) as { user_id: string } | undefined;
        if (realUserID?.user_id)
        {
            imgPath = avatarsRoot + realUserID.user_id + ".png";
            if (!fs.existsSync(imgPath))
                imgPath = avatarsRoot + "default.png";
        }
        else
            imgPath = avatarsRoot + "default.png";
    }

    const imgBuffer = fs.readFileSync(imgPath);

    reply.header('content-type', 'image/png').send(imgBuffer);
}

async function postAvatarRoute(request: FastifyRequest, reply: FastifyReply)
{
    const sessionID = request.cookies[SESSION_ID_COOKIE_NAME]
    if (!sessionID)
    {
        reply.code(401).send("No session found");
        return;
    }
    const userID = await validateSession(sessionID);
    if (!userID)
    {
        reply.code(401).send("Session invalid");
        return;
    }

    const imgData = await request?.file();
    if (!imgData)
    {
        reply.code(400).send("No image given");
        return;
    }

    if (imgData.mimetype !== "image/png")
    {
        reply.code(400).send("File is not a png");
        return;
    }

    // const image = imgData as Blob;

    const imgPath = avatarsRoot + userID + ".png";

    if (fs.existsSync(imgPath))
        fs.rmSync(imgPath);

    const imgFile = fs.createWriteStream(imgPath);

    pipeline(imgData.file, imgFile, () => {
        // I don't know why this needs to be here
    });

    reply.send();
}