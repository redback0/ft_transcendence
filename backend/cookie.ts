import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { db } from './database';

export const COOKIE_NAME = 'session_id';

export async function createUserSession(userId: string): Promise<string>
{
    let uuid = null;
    let result;
    do
    {
        uuid = uuidv4();
        const statement = db.prepare('SELECT COUNT(*) as count FROM users WHERE session_id = ?');
        result = statement.get(uuid) as { count: number };

    } while (result.count > 0);
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
                sameSite: 'strict',
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
        const statement = db.prepare('UPDATE users SET session_id = NULL WHERE user_id = ?');
        const update = statement.run(userId);
        reply
            .clearCookie(COOKIE_NAME, { path: '/' })
            .send({ message: 'Logged out, cookie cleared' });
    }
    catch (error)
    {
        reply.code(500).send({ error: 'Failed to clear session' });
    }
}
