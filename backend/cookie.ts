import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { db } from './server';

export const COOKIE_NAME = 'session_id';

export async function createUserSession(userId: string): Promise<string>
{
    const uuid = uuidv4();
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

export async function clearUserSession(userId: string): Promise<void>
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

export function registerCookieRoutes(fastify: FastifyInstance, userId: string)
{
    fastify.get('/login', async (request, reply) => {
        return await setUUIDCookie(request, reply, userId);
    });
    fastify.get('/profile', getUUIDCookie);
    fastify.get('/logout', async (request, reply) => {
        return await clearUUIDCookie(request, reply, userId);
    });
}

export async function setUUIDCookie(request: FastifyRequest, reply: FastifyReply, userId: string): Promise<void>
{
    const uuid = uuidv4();
    
    try
    {
        const statement = db.prepare('UPDATE users SET session_id = ? WHERE user_id = ?');
        const update = statement.run(uuid, userId);
        
        reply
            .setCookie(COOKIE_NAME, uuid, {
                path: '/',
                httpOnly: true,
                sameSite: 'lax', // TODO: Set to 'strict' in production
                secure: false, // TODO: Set to 'true' in production
                domain: 'localhost', // TODO change to URL ttpg.xyz. Not https://ttpg.xyz
                maxAge: 60 * 60 * 24 / 2 // 0.5 day
            })
            .send({ message: 'UUID stored in cookie', session_id: uuid });
    }
    catch (error)
    {
        reply.code(500).send({ error: 'Failed to set session cookie' });
    }
}

export async function getUUIDCookie(request: FastifyRequest, reply: FastifyReply): Promise<string | null>
{
    const sessionId = request.cookies[COOKIE_NAME];

    if (!sessionId)
    {
        reply.code(401).send({ error: 'Not logged in' });
        return null;
    }
    else
    {
        reply.send({ session_id: sessionId });
        return sessionId;
    }
}

export async function clearUUIDCookie(request: FastifyRequest, reply: FastifyReply, userId: string): Promise<void>
{
    try
    {
        // Clear database session first
        const statement = db.prepare('UPDATE users SET session_id = NULL WHERE user_id = ?');
        const update = statement.run(userId);
        
        // Then clear cookie
        reply
            .clearCookie(COOKIE_NAME, { path: '/' })
            .send({ message: 'Logged out, cookie cleared' });
    }
    catch (error)
    {
        reply.code(500).send({ error: 'Failed to clear session' });
    }
}
