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
    fastify.post('/signup', { schema: postSignUp }, SignUpUser);
    fastify.get('/login', { schema: getLogin },  LoginUser);
    fastify.post('/changepw', { schema: postChangePw }, ChangePw);
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
        // TO DO: Call route for add new cookie
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

//LoginUser function won't work due to nil use of bcrypt.compare() - Nicole
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




// CHANGE PASSWORD

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

async function ChangePw(request: FastifyRequest, reply: FastifyReply)
{
    const { username, old_password, new_password } = request.body as { username: string, old_password: string, new_password: string }
    
    //Does old pw match users pw in db - GET


    //Ensure new pw not the same as previous 4 pw in DB for user - GET


    //Hash and POST newpw, hashed in db

    //IN DB:
    // user_password_prev3 = user_password_prev2;
    // user_password_prev2 = user_password_prev1;
    // user_password1 = user_password;

}
	

    interface LoginChecks {
	enteredUser:string;
	enteredPw:	string;
	hashedPw:	string;
	salt:		string;
	saltRounds:	number;

	userHasNoWhite():	boolean;

	pwCheck():			boolean;

	pwHasNoWhite():		boolean;
	pwHasMinTwelveChar():		boolean;
	pwHasUpper():		boolean;
	pwHasLower():		boolean;
	pwHasNb():			boolean;
	pwHasSymbol():		boolean;

    pwNotPrevFourHash(enteredUser: string, enteredPw: string):boolean;
	authenticatePw(enteredUser: string, enteredPw: string): boolean;
	setPw(enteredUser: string, enteredPw: string): boolean;
};

class ILoginChecks implements LoginChecks {
	enteredUser:string;
	enteredPw:	string;
	hashedPw:	string; //Probs don't need this - Nicole
	salt:		string; //Probs don't need this - Nicole
	saltRounds: number;

	constructor(enteredUser: string, enteredPw: string, saltRounds: number = 10)
	{
		this.enteredUser = enteredUser;
		this.enteredPw = enteredPw;
		this.hashedPw = '';
		this.salt = '';
		this.saltRounds = saltRounds;
	}
	
	userHasNoWhite(): boolean {return (!/\s/.test(this.enteredUser))}

	pwCheck(): boolean {
		return (this.pwHasMinTwelveChar()
			&& this.pwHasNoWhite()
			&& this.pwHasUpper()
			&& this.pwHasLower()
			&& this.pwHasNb()
			&& this.pwHasSymbol()
		);
	}

	pwHasMinTwelveChar(): boolean {return (this.enteredPw.length >= 12);}
	pwHasNoWhite(): boolean {return (!/\s/.test(this.enteredPw));}
	pwHasUpper(): boolean {return /[A-Z]/.test(this.enteredPw);}
	pwHasLower(): boolean {return /[a-z]/.test(this.enteredPw);}
	pwHasNb(): boolean {return /[0-9]/.test(this.enteredPw)}
	pwHasSymbol(): boolean {return /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/.test(this.enteredPw);}

    pwNotPrevFourHash(enteredUser: string, enteredPw: string): boolean
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
                if (bcrypt.compareSync(enteredPw, dbPasswords.user_password)
                    || bcrypt.compareSync(enteredPw, dbPasswords.user_password_prev1)
                    || bcrypt.compareSync(enteredPw, dbPasswords.user_password_prev2)
                    || bcrypt.compareSync(enteredPw, dbPasswords.user_password_prev3))
                {
                    console.log('New password matches one of previous 4 passwords.');
                    return false;
                }
                else
                {
                    console.log('New password does not match previous 4 passwords.');
                    return true;
                }
            } catch (bcryptError) {
                console.error('Error comparing passwords.', bcryptError);
                return false;
            }
    } catch (dbError) {
        console.error('Error checking previous passwords: ', dbError);
        return false;
        }
    }

	authenticatePw(enteredUser: string, enteredPw: string): boolean
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
                if (!bcrypt.compareSync(enteredPw, db_pw))
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

    setPw(enteredUser: string, enteredPw: string): boolean
    {
        //authenticatePw function call. If true, cont.
        //Pw passes syntax checks? If true, cont.
        //NotPrevFourPwHash function call. If true, cont.
        //Hash password. If it works, cont.
        //Move db passwords over by one.
        //Store hashed password in db - user_password.
        //If all this works, return true
        
    }



	hashPw(enteredPw: string): void
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
}