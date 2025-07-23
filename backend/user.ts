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
        const { username, hashedPassword } = request.body as { username: string, hashedPassword: string };
        //search database for existing username
        const findUser = db.prepare('SELECT COUNT(*) as count FROM users WHERE user_id = ?');
        let result = findUser.get(username) as { count: number };
        if (result.count > 0)
        {
            // if yes, return error -> user already taken
            request.log.error('Error unable to create account username already exists');
            reply.send({error: 'Failed to create account. Username already exists.'});
            return ;
        }
        //if no insert into database
        const createDate = new Date().toISOString();
        const insertUser = db.prepare('INSERT INTO users (username, user_password, date_account_made) VALUES (?, ?, ?)');
        const post = insertUser.run(username, hashedPassword, createDate);      
        reply.code(200).send(post);
        //TODO: if successfull, load new home page with index that include my profile, my chat -> done in the front end
        return ;
    }
    catch (error) {
        request.log.error('Error unable to create account', error);
        reply.send({ error: 'Failed to create account' });
    }
}  
// need to add the sql database commands everywhere -> TODO: make a sqlite file to do this because it will be annoying otherwise
async function LoginUser(request: FastifyRequest, reply: FastifyReply)
{
    try
    {
        const { username, hashedPassword } = request.body as { username: string, hashedPassword: string }
        const statement = db.prepare('SELECT username, user_password FROM users WHERE username = ?');
        const dbRecord = statement.get(username) as { username: string, user_password: string } | undefined;

        if (dbRecord)
        {
            const dbUser = dbRecord.username;
            const dbUserPassword = dbRecord.user_password;

            if (hashedPassword === dbUserPassword) // TODO: how to hash the passwords?
            {
                reply.code(200).send({ message: 'Login successful', username: dbUser });
                // TODO: load profile page or somthing here. 
                return ;
            }
        }
        else
        {
            reply.send({ error: 'Invalid username or password' });
            return;
        }        
    }
    catch (error)
    {
        request.log.error('Can not login: ', error);
        reply.send({ error: 'Login failed.' });
    }
}

/*
	pwNotPrevFourHash(): boolean
	{
		this.enteredUser;

		// ADD: COMPARE TO PREVIOUS 3 PASSWORDS (NOT CURRENT)

		bcrypt.compare() //compare plaintext pw with hashed counterpart

	}

	authenticatePw(enteredUser: string): boolean
	{
		const dbHashedPw =  ; //ADD: SQL CHECKING STUFF 
		const inputtedPw = this.enteredPw;

		bcrypt.compare(inputtedPw, dbHashedPw, (err: undefined, result: boolean) => {
			if (err)
				//HANDLE ERROR
			return result;
		})
	}

	hashPw(): void
	{
		
		bcrypt.genSalt(this.saltRounds, (err: undefined, salt: string) => {
			if (err)
				//HANDLE ERROR
			this.salt = salt;
			return;
			})

		bcrypt.hash(this.enteredPw, this.salt, (err: undefined, hashedPw: string) => {
			if (err)
				//HANDLE ERROR
			this.hashedPw = hashedPw;

		})
	}