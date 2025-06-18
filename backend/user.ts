// Authored by Nicole L, 18 June 2025

class User {
	username:		string;
	pwHash:			string;
	pwSalt:			string
	onlineStatus:	boolean;
	uid:			number;
	longestRally:	boolean;
	numLosses:		number;
	numWins:		number;
	dateCreated:	string;
	dateLastLogin:	string;
	avatar:			string;

	//gameHistory;
	//friends
}

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