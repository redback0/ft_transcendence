//Authored by Bethany Milford 27/10/25
import fastify, { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { SESSION_ID_COOKIE_NAME, sidToUserIdAndName, getUserInfo } from "./cookie";
import { db } from "./database";

export interface Match {
  left_id: string;
  left_username: string;
  left_result: string;
  right_id: string;
  right_username: string;
  right_result: string;
  left_score: number;
  right_score: number;
  date_finished: string;
  date_aus: string;
};
 export async function registerRoutes(fastify: FastifyInstance)
 {
    fastify.post('/api/userpage/matches', routeGetMatches);
    fastify.post('/api/users/results', getMatchResultsFromDatabase);
 }

async function routeGetMatches(request: FastifyRequest, reply: FastifyReply)
{
    const { username } = request.body as { username: string };
	if (!username || typeof username !== 'string')
	{
		reply.code(400).send({ error: 'Username not given.' });
		return ;
	}
    const matches = await getMatchesFromDatabase(username);
    if (matches)
        reply.send(matches);
    else
        reply.code(500).send({ error: `Cannot find matches` });
}

async function getMatchesFromDatabase(username: string): Promise<Match[] | null>
{
    try
    {
        const { user_id } = db.getUserIdFromUsername.get(username) as { user_id: string };
        if (!user_id)
        {
            console.error("Matches: user not found");
            return null;
        }
        const matches = db.getAllOfAUsersGames.all(user_id, user_id) as Match[];
        matches.forEach(match => {
            const lusername = db.getUsernameFromUserId.get(match.left_id) as {username: string } | undefined;
            const rusername = db.getUsernameFromUserId.get(match.right_id) as {username: string } | undefined;
            if (lusername && rusername)
            {
                match.left_username = lusername.username;
                match.right_username = rusername.username;
            }
            if (match.right_score > match.left_score)
            {
                match.right_result = "Winner";
                match.left_result = "Loser";
            }
            else
            {
                match.right_result = "Loser";
                match.left_result = "Winner";
            }
            const date = new Date(match.date_finished);
            const day = date.getDate();
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            match.date_aus = day + "/" + month + "/" + year;

        })
        return(matches);
    }
    catch (error)
    {
        console.log(`Cannot select matches from database: ${error}`);
        return null;
    }
}
async function getMatchResultsFromDatabase(request: FastifyRequest, reply: FastifyReply)
{
	const { username } = request.body as { username: string }
    if (!username)
	{
		reply.code(400).send({ error: "Username does not exist." });
		return;
	}

	const result = db.getUserIdFromUsername.get(username) as { user_id: string } | undefined;
	if (!result)
	{
		reply.code(400).send({ error: "User ID does not exist." });
		return;
	}

	const user_id = result.user_id;

    try 
    {
		const wins_statement = db.prepare("SELECT COUNT (*) as count FROM game WHERE (left_id = ? AND left_score > right_score) OR (right_id = ? AND right_score > left_score)");
        const winObject = wins_statement.get(user_id, user_id) as { count: number };
		const wins = winObject.count;

		const losses_statement = db.prepare("SELECT COUNT (*) as count FROM game WHERE (left_id = ? AND left_score < right_score) OR (right_id = ? AND right_score < left_score)");
        const lossObject = losses_statement.get(user_id, user_id) as { count: number };
		const losses = lossObject.count;

        reply.send({ wins, losses })
    }
    catch (error)
    {
        console.log(`Cannot select wins/losses from database: ${error}`);
        return null;       
    }
}
