// Authored by Nicole L, 18 June 2025

//TO DO:
//
//	- USERNOEXIST() : CHECK THE INPUTTED USER DOES NOT ALREADY EXIST ON THE DB
//  - PWNOTPREVFOURHASH() : COMPARE TO PREVIOUS 3 PASSWORDS (NOT CURRENT)
//  - AUTHENTICATEPW () : LINK SQL STUFF FOR COMPARISON
//  - AUTHENTICATEPW() : ERROR HANDLING
//  - HASHPW() : ERROR HANDLING
//  - ADDUSER/DELETEUSER/CHANGEPW/CHANGEAVATAR


import Fastify, { FastifyInstance, RouteShorthandOptions } from 'fastify'
import { initChat, chatWebSocketServer } from './chat.js';
import * as Game from './game.js';
import Database from 'better-sqlite3';
import { BooleanLiteral } from "typescript";
import * as bcrypt from 'bcrypt';

//POST

interface LoginChecks {
	enteredUser:string;
	enteredPw:	string;
	hashedPw:	string;
	salt:		string;
	saltRounds:	number;

	userCheck():		boolean;

	userHasNoWhite():	boolean;
	userNoExist():		boolean;

	pwCheck():			boolean;

	pwHasNoWhite():		boolean;
	pwHasMinTwelveChar():		boolean;
	pwHasUpper():		boolean;
	pwHasLower():		boolean;
	pwHasNb():			boolean;
	pwHasSymbol():		boolean;
	pwNotHashPrevFour():boolean;

	authenticatePw(enteredUser: string): boolean

	hashPw():			void;
	//change pw()
	//change/set avatar()
	//create user()
	//delete user(), zero everything except for uid


};

class ILoginChecks implements LoginChecks {
	enteredUser:string;
	enteredPw:	string;
	hashedPw:	string;
	salt:		string;
	saltRounds: number;

	constructor(enteredUser: string, enteredPw: string, saltRounds: number = 10)
	{
		this.enteredUser = enteredUser;
		this.enteredPw = enteredPw;
		this.hashedPw = '';
		this.salt = '';
		this.saltRounds = saltRounds;
	}

	userCheck(): boolean {
		return (this.userNoExist()
			&& this.userInputNoWhite()
		);
	}
	
	userInputNoWhite(): boolean
	{
		return (!/\s/.test(this.enteredUser))
	}

	userNoExist(): boolean
	{
		// ADD : CHECK THE INPUTTED USER DOES NOT ALREADY EXIST ON THE DB
		//check the value thing from database
		//something like this?:

		/*const CheckData = db.prepare("SELECT COUNT(*) FROM users WHERE username = ?").run(data.username);
	
		if (!CheckData)
		{
			//insert data
			const insertData = db.prepare("INSERT INTO users (username, user_password) VALUES ( ?, ?)"); // This is safer than concatanation. 
			insertData.run(data.username, data.user_password);
		}*/

	}

	pwCheck(): boolean {
		return (this.pwHasMinTwelveChar()
			&& this.pwHasNoWhite()
			&& this.pwHasUpper()
			&& this.pwHasLower()
			&& this.pwHasNb()
			&& this.pwHasSymbol()
			&& this.pwNotPrevFourHash()
		);
	}

	pwHasMinTwelveChar(): boolean
	{
		return (this.enteredPw.length >= 12);
	}

	pwHasNoWhite(): boolean {
		return (!/\s/.test(this.enteredUser));
	}

	pwHasUpper(): boolean
	{
		return /[A-Z]/.test(this.enteredPw);
	}

	pwHasLower(): boolean
	{
		return /[a-z]/.test(this.enteredPw);
	}

	pwHasNb(): boolean
	{
		return /[0-9]/.test(this.enteredPw);
	}

	pwHasSymbol(): boolean
	{
		return /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/.test(this.enteredPw);
	}

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


}



		//FASTIFY - THE BACKEND SERVER
		//fastify.post -> for stuff that uses private information, not cached & more 
		//fastify.get -> 




// class User {
// 	username:		string;
// 	pwHash:			string;
// 	pwSalt:			string
// 	onlineStatus:	boolean;
// 	uid:			number;
// 	longestRally:	boolean;
// 	numLosses:		number;
// 	numWins:		number;
// 	dateCreated:	string;
// 	dateLastLogin:	string;
// 	avatar:			string;

	//gameHistory;
	//friends };




// 1. Session tokens - the idea, not the term
// 2. SQL Crash course
// 3. People to create users in the database - Work with Jack (SQL)
// 4. Create and modify users

// ** CONCEPTS TO STUDY **
//		Web requests
//		Hashing and salting
//		SQL (& TS)
//		Caching

// Cache number of wins and losses
// Every request on the backend needs to be authenticated
// It could come from not the frontend. You need to be always checking
// Anything that can be done on the frontend to the backend must have security behind it
// The backend must be self authenticating
// If someone is trying to modify their details, that they are changing their own details
// Session token (?) 

//