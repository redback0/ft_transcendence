import fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { db } from './database';

export const COOKIE_NAME = 'session_id';

export function registerCookieRoutes(fastify: FastifyInstance)
{
    fastify.post('/cookieLogin', async (request, reply) => {
        const { username } = request.body as { username: string };
        return await routeMakeNewCookie(request, reply, username);
    });

    fastify.get('/cookieProfile', routeCheckUserSession);

    fastify.post('/cookieLogout', async (request, reply) => {
        return await routeClearCookie(request, reply);
    });
}

/**
 * @param username the current logged in account name. 
 * @description Sets a UUID to the database and a cookie for the current user; adds the UUID to a cookie and sends the cookie as a reply. 
 */
export async function routeMakeNewCookie(request: FastifyRequest, reply: FastifyReply, username: string)
{
    try
    {
        const result = db.getUserIdFromUsername.get(username) as { user_id: string } | undefined;
        if (!result)
        {
            reply.code(500).send({ error: 'Cannot create cookie.' });
            return ;
        }
        const userId = result.user_id;

        const uuid = await setUuid(userId);
        reply
            .setCookie(COOKIE_NAME, uuid, {
                path: '/',
                httpOnly: true,
                sameSite: 'strict',
                secure: false, // TODO: Set to 'true' in production
                domain: 'localhost', // TODO change to URL ttpg.xyz. Not https://ttpg.xyz
                maxAge: 60 * 60 * 24 // 1 day
            })
            .send({ message: 'UUID stored in cookie', session_id: uuid });
    }
    catch (error)
    {
        reply.code(500).send({ error: 'Failed to set session cookie' });
    }
}

/**
 * 
 * @param userId the current logged in account name. 
 * @returns On sucess: The UUID generated for the user as a Promised string. 
 * On error: throws error to stnadrd error. 
 * @description Creates a UUID for the user and sets it in the database under attribue 'session_id' and return the UUID. 
 */
export async function setUuid(userId: string): Promise<string>
{
    let uuid = null;
    let baseUuid = null;
    let result;
    let attempt = 0;
    do
    {
        if (attempt >= 100)
        {
            throw new Error('Cannot create user. Try again later.');
        }
        baseUuid = uuidv4();
        uuid = `${attempt}-${baseUuid}`;
        const statement = db.prepare('SELECT COUNT(*) as count FROM users WHERE session_id = ?');
        result = statement.get(uuid) as { count: number };
        attempt++;
    }
    while (result.count > 0);

    try
    {
        const statement = db.prepare('UPDATE users SET session_id = ? WHERE user_id = ?');
        statement.run(uuid, userId);
        return uuid;
    }
    catch (error)
    {
        throw new Error('Failed to create user session');
    }
}

/**
 * @description Gets the current users session Id from the user cookie, validates the UUID in the cookie with the database. 
 */
export async function routeCheckUserSession(request: FastifyRequest, reply: FastifyReply) : Promise<void>
{
    const sessionId = request.cookies[COOKIE_NAME];

    if (!sessionId)
    {
        reply.code(403).send({ error: 'Not logged in' });
        return ;
    }
    else
    {
        const userId = await validateSession(sessionId);
        if (!userId)
        {
            reply.code(401).send({ error: 'Invalid session' });
            return ;
        }
        reply.send({ session_id: sessionId });
        return ;
    }
}

/**
 * @param sessionId The users temporary UUID from their cookie. 
 * @returns The users userId if the session exists in the database or null on error or if it does not exist. 
 * @description See returns. 
 */
export async function validateSession(sessionId: string): Promise<string | null>
{
    try
    {
        const statement = db.prepare('SELECT user_id FROM users WHERE session_id = ?');
        const result = statement.get(sessionId) as { user_id: string } | undefined;
        return result?.user_id || null;
    }
    catch (error)
    {
        return null;
    }
}

/**
 * @param userId The users id. 
 * @description Will remove the cookie from the users browser and attempt to clear the UUID from the databse by calling clearUserSession. 
 */
export async function routeClearCookie(request: FastifyRequest, reply: FastifyReply): Promise<void>
{
    const sessionId = request.cookies[COOKIE_NAME];
    
    if (!sessionId)
    {
        reply.code(403).send({ error: 'Not logged in' });
        return ;
    }

    const userId = await validateSession(sessionId);
    if (!userId)
    {
        reply.code(401).send({ error: 'Invalid session' });
        return ;
    }
    try
    {
        await clearUserSession(userId);
        reply
            .clearCookie(COOKIE_NAME, { path: '/' })
            .send({ message: 'Logged out, cookie cleared' });
    }
    catch (error)
    {
        reply.code(500).send({ error: 'Failed to clear session' });
    }
}

/**
 * @param userId The users userId. 
 * @description Will clear the users current users.session_id from the database. 
 */
export async function clearUserSession(userId: string)
{
    try
    {
        const statement = db.prepare('UPDATE users SET session_id = NULL WHERE user_id = ?');
        statement.run(userId);
    }
    catch (error)
    {
        throw new Error('Failed to clear user session');
    }
}
