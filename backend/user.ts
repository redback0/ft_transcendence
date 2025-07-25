//Authored by Bethany Milford 18/07/2025
//Authored by Nicole Lehmeyer 23/07/2025
//Authored by Jack Church 23/07/2025

//TO DO: 
//  - Check inputted pw is not the same as the previous four passwords
//  - Hash passwords
//  - integrate bcrypt.compare() function in LoginUser
//  ** All existing code from use branch commented at file end

import fastify, { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { appendFile } from "fs"; 
import { createUserSession } from "./cookie";
import { db } from "./server";
import { request } from "http";
import * as bcrypt from 'bcrypt';
import { escapeLeadingUnderscores } from "typescript";

async function registerRoutes(fastify: FastifyInstance)
{
    fastify.post('/api/signup', { schema: postCreateUser }, CreateUser);
    fastify.get('/api/login', { schema: getLogin },  LoginUser);
    fastify.post('/api/changepw', { schema: postChangePw }, ChangePw);
    fastify.post('/api/deleteuser', { schema: postDeleteUser }, DeleteUser);
} 

export default registerRoutes;

const postCreateUser = {
    body: {
        type: 'object',
        required: ['username','password'],
        properties: {
            username: { type: 'string'},
            password: { type: 'string'},
        },
    },
};

async function CreateUser(request: FastifyRequest, reply: FastifyReply)
{
    try {
        const { username, password } = request.body as { username: string, password: string };
        const createUserActions = new IUserActions(username, password);
        if (!createUserActions.userNoExist(username)) {
            reply.code(409).send({ error: 'Username taken.' }); // <-409 = Conflict
            return;
        }
        if (!createUserActions.pwCheck(password)) {
            reply.code(422).send({ error: 'Password does not meet syntax requirements.' });  // <-422 = Unprocessable entity
            return;
        }
        if (!createUserActions.createUser(username, password)) {
            reply.code(422).send({ error: 'Insufficient data for user creation.' });
            return;
        }
    } catch (error) {
        request.log.error('Failed to create user.', error);
        reply.code(500).send({ error: 'Server error in processing create user request.' });
    }
} 


const getLogin = {
    body: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
            username: { type: 'string'},
            password: { type: 'string'},
        },
        additionalProperties: false
    },
};

async function LoginUser(request: FastifyRequest, reply: FastifyReply)
{
    try {
        const { username, password } = request.body as { username: string, password: string }
        const loginUserActions = new IUserActions(username, password);
        if (!loginUserActions.authenticatePw(username, password))
        {
            reply.code(401).send({ error: 'Username or password is incorrect.' });
            return;
        }
        reply.code(200).send({ message: 'User logged in successfully.' });
        //Take user to profile page
    } catch (error) {
        request.log.error('Failed to change password.', error);
        reply.code(500).send({ error: 'Server error in processing password change request.' });
    }
}

const postChangePw = {
    body: {
        type: 'object',
        required: ['old_password', 'new_password'],
        properties: {
            username: { type: 'string' },
            old_password: { type: 'string' },
            new_password: { type: 'string' }, 
        },
    },
}

export async function ChangePw(request: FastifyRequest, reply: FastifyReply)
{
    try {
        const { username, old_password, new_password } = request.body as { username: string, old_password: string, new_password: string }
        const changePwUserActions = new IUserActions(username, old_password, new_password);
        if (!changePwUserActions.authenticatePw(username, old_password)) {
            reply.code(401).send({ error: 'Username or password is incorrect.' });
            return;
            }
        if (changePwUserActions.setPw(username, new_password)) {
            reply.code(200).send({ message: 'Password changed successfully.' });
            //Take user to profile page
            return;
        } else {
            reply.code(401).send({ error: 'Failed to change password.' });
            return;
        }
    } catch (error) {
        request.log.error('Failed to change password.', error);
        reply.code(500).send({ error: 'Server error in processing password change request.' });
    }
}

const postDeleteUser = {
    body: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
            username: { type: 'string' },
            password: { type: 'string' }, 
        },
    },
}

export async function DeleteUser(request: FastifyRequest, reply: FastifyReply)
{
    try {
        const { username, password } = request.body as { username: string, password: string };
        const deleteUserActions = new IUserActions(username, password);
        if (!deleteUserActions.authenticatePw(username, password))
            {
                reply.code(401).send({ error: 'Username or password is incorrect.' });
                return;
            }
            if (deleteUserActions.clearUser(username)) {
                reply.code(200).send({ message: 'User deleted successfully.' });
                //Take user to a page?
                return;
            } else {
                reply.code(401).send({ error: 'Failed to delete user.' });
                return;
            }
    } catch (error) {
        request.log.error('Failed to delete user.', error);
        reply.code(500).send({ error: 'Server error in processing delete user request.' });
    }
}
	

interface UserActions {
enteredUser:string;
currentPw:	string;
newPw:      string;
saltRounds:	number;

userHasNoWhite():	boolean;
userNoExist(enteredUser: string): boolean;

pwCheck(pw: string):			boolean;

pwHasNoWhite():		boolean;
pwHasMinTwelveChar():		boolean;
pwHasUpper():		boolean;
pwHasLower():		boolean;
pwHasNb():			boolean;
pwHasSymbol():		boolean;

pwNotPrevFourHash(enteredUser: string, newPw: string):boolean;
authenticatePw(enteredUser: string, currentPw: string): boolean;
setPw(enteredUser: string, newPw: string): boolean;
createUser(enteredUser: string, newPw: string): boolean;
clearUser(enteredUser: string): boolean;
};

class IUserActions implements UserActions {
	enteredUser:string;
	currentPw:	string;
    newPw:      string;
	saltRounds: number;

	constructor(enteredUser: string, currentPw: string = '', newPw: string = '', saltRounds: number = 10)
	{
		this.enteredUser = enteredUser;
		this.currentPw = currentPw;
        this.newPw = newPw;
		this.saltRounds = saltRounds;
	}
	
	userHasNoWhite(): boolean {return (!/\s/.test(this.enteredUser))}

    userNoExist(enteredUser: string): boolean {
        try {

            const statement_num_users = db.prepare('SELECT COUNT (*) FROM users WHERE username = ?');
            const num_users = statement_num_users.get(enteredUser);
            
            if (num_users != 0)
                {
                    console.log(`User ${enteredUser} exists in the database.`);
                    return false;
                }
                else
                    {
                        console.log(`User ${enteredUser} does not exist in the database.`);
                        return true;
                    }
        } catch (dbError) {
        console.error('Error checking for existing user.', dbError);
        return false;
        }
    }

	pwCheck(newPw: string): boolean {
		return (this.pwHasMinTwelveChar()
			&& this.pwHasNoWhite()
			&& this.pwHasUpper()
			&& this.pwHasLower()
			&& this.pwHasNb()
			&& this.pwHasSymbol()
		);
	}

	pwHasMinTwelveChar(): boolean {return (this.newPw.length >= 12);}
	pwHasNoWhite(): boolean {return (!/\s/.test(this.newPw));}
	pwHasUpper(): boolean {return /[A-Z]/.test(this.newPw);}
	pwHasLower(): boolean {return /[a-z]/.test(this.newPw);}
	pwHasNb(): boolean {return /[0-9]/.test(this.newPw)}
	pwHasSymbol(): boolean {return /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/.test(this.newPw);}

    pwNotPrevFourHash(enteredUser: string, newPw: string): boolean
	{
        try {
            interface db_pw_struct {
                user_password: string;
                user_password_prev1: string | null;
                user_password_prev2: string | null;
                user_password_prev3: string | null;
            }

            const statement_db_pw = db.prepare('SELECT user_password, user_password_prev1, user_password_prev2, user_password_prev3 FROM users WHERE username = ?');
            const dbPasswords = statement_db_pw.get(enteredUser) as db_pw_struct | undefined;
            if (!dbPasswords)
            {
                console.log(`User ${enteredUser} not found in database.`);
                return false;
            }
            try {
                const pw_arr = [
                    { label: 'current password', hash: dbPasswords.user_password },
                    { label: 'a previous password', hash: dbPasswords.user_password_prev1 },
                    { label: 'a previous password', hash: dbPasswords.user_password_prev2 },
                    { label: 'a previous password', hash: dbPasswords.user_password_prev3 }
                ];
                for (const item of pw_arr) {
                    if (item.hash && bcrypt.compareSync(newPw, item.hash)) {
                        console.log(`New password matches ${item.label}`);
                        return false;
                    }
                }
                console.log('New password does not match previous 4 passwords.');
                return true;
            } catch (bcryptError) {
                console.error('Error comparing passwords.', bcryptError);
                return false;
            }
    } catch (dbError) {
        console.error('Error checking previous passwords.', dbError);
        return false;
        }
    }

	authenticatePw(enteredUser: string, currentPw: string): boolean
	{
		try {

            const statement_db_pw = db.prepare("SELECT user_password FROM users WHERE username = ?");
            const db_pw = statement_db_pw.get(enteredUser);
            if (!db_pw)
            {
                console.log(`User ${enteredUser} not found in database.`);
                return false;
            }
            try {
                if (!bcrypt.compareSync(currentPw, db_pw))
                {
                    console.log('Entered password does not match user\'s database stored password.');
                    return false;
                }
                else
                {
                    console.log('Entered password matches user\'s database password.');
                    return true;
                }
            } catch (bcryptError) {
                console.error('Error comparing passwords.', bcryptError);
                return false;
            }
        } catch (dbError) {
            console.error('Error authenticating user.', dbError);
            return false;
        }
    }

    setPw(enteredUser: string, newPw: string): boolean
    {

        try {
            // 1. Does enteredPw pass syntax checks?
            if (!this.pwCheck(newPw))
            {
                console.log('New password does not pass syntax checks.');
                return false;
            }
            // 2. Is enteredPw same as previous 4 passwords?
            if (!this.pwNotPrevFourHash(enteredUser, newPw))
            {
                console.log('New password is the same as one of the previous stored passwords.');
                return false;
            }
            // 3. Hash password
            const salt = bcrypt.genSaltSync(this.saltRounds);
            const hashedNewPassword = bcrypt.hashSync(newPw, salt);

            //4. Move db passwords over by one & add new password to db
            //   Prepare a transaction, if any errors - ensure to ROLLBACK, else COMMIT and return true
            try {
                interface db_pw_struct {
                user_password: string;
                user_password_prev1: string | null;
                user_password_prev2: string | null;
                user_password_prev3: string | null;
                }

                db.prepare('BEGIN TRANSACTION').run();
                const statement_db_pw = db.prepare('SELECT user_password, user_password_prev1, user_password_prev2, user_password_prev3 FROM users WHERE username = ?');
                const dbPasswords = statement_db_pw.get(enteredUser) as db_pw_struct | undefined;
                if (!dbPasswords)
                {
                    console.log(`User ${enteredUser} not found in database.`);
                    db.prepare('ROLLBACK').run();
                    return false;
                }

                const update_statement_db_pw = db.prepare(`
                    UPDATE users
                    SET
                        user_password_prev3 = user_password_prev2,
                        user_password_prev2 = user_password_prev1,
                        user_password_prev1 = user_password,
                        user_password = ?
                    WHERE username = ?
                    `);
                update_statement_db_pw.run(hashedNewPassword, enteredUser);

                db.prepare('COMMIT').run();
                console.log(`Password updated sucessfully for user: ${enteredUser}.`);
                return true;
            } catch(dbError) {
                db.prepare('ROLLBACK').run();
                console.error('Database error in attempt to update password.', dbError);
                return false;
            }
        } catch(error) {
            console.log('Error in setPw.', error);
            return false;
        }
    }

    createUser(enteredUser: string, newPw: string): boolean {
        try {
            const userId = require('crypto').randomUUID();
            const currentDate = new Date().toISOString();
            const salt = bcrypt.genSaltSync(this.saltRounds);
            const hashedNewPassword = bcrypt.hashSync(newPw, salt);
            
            try {
                db.prepare('BEGIN TRANSACTION').run();
                const statement_create_usr = db.prepare(`
                    INSERT INTO users (user_id, username, user_password, date_account_made)
                    VALUES (?, ?, ?, ?)
                    `);
                statement_create_usr.run(userId, enteredUser, hashedNewPassword, currentDate);
                db.prepare('COMMIT').run();
                console.log(`User: ${enteredUser} created successfully.`);
                return true;
            } catch (error) {
                db.prepare('ROLLBACK').run();
                console.error('Database error in attempt to create user.', error);
                return false;
            }
        } catch (error) {
            console.error('Error in creating user.', error);
            return false;
        }
    }


    clearUser(enteredUser: string): boolean {
        try {
            db.prepare('BEGIN TRANSATION').run();
            const statement_clr_usr = db.prepare(`
                UPDATE users
                SET
                    username = 'Account Deactivated',
                    user_password = NULL,
                    longest_rally = NULL,
                    session_id = NULL,
                    num_of_loss = NULL,
                    num_of_win = NULL,
                    user_password_prev1 = NULL,
                    user_password_prev2 = NULL,
                    user_password_prev3 = NULL,
                    avatar = NULL,
                    account_is_closed = 1
                WHERE username = ?
                `);
            statement_clr_usr.run(enteredUser);
            db.prepare('COMMIT').run();
            console.log(`User data cleared successfully for user: ${enteredUser}.`);
            return true;
        } catch(dbError) {
            db.prepare('ROLLBACK').run();
            console.log(`Error in clearing user data for user: ${enteredUser}.`, dbError);
            return false;
        }
    }
}