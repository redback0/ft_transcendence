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
  date_game_made: string;
};
 export async function registerRoutes(fastify: FastifyInstance)
 {
    fastify.post('/api/userpage/matches', routeGetMatches);
    fastify.post('api/users/results', getMatchResultsFromDatabase);
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
        //const username = db.getUserIdFromUsername.run(username);
        const matches = db.getAllOfAUsersGames.all(username) as Match[];
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
            else if (match.right_score > match.left_score)
            {
                match.right_result = "Loser";
                match.left_result = "Winner";
            }
            else if (match.right_score === match.left_score)
            {
                match.right_result = "Tie";
                match.left_result = "Tie";
            }
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
    const user_id = request.body as { user_id: string}
    if (!user_id)
	{
		reply.code(400).send({ error: "Friend id doesnot exist." });
		return;
	}
    try 
    {
        db.prepare('BEGIN TRANSACTION').run();
        const wins_statement = db.prepare('COUNT * (WHERE left_id == userid AND left_score > right_score) OR (WHERE right_id == userid AND right_score > left_score) FROM game');
        const wins = wins_statement.get(user_id) as number | undefined;

        const loss_statement = db.prepare('COUNT * (WHERE left_id == userid AND left_score < right_score) OR (WHERE right_id == userid AND right_score < left_score) FROM game');
        const losses = loss_statement.get(user_id) as number | undefined;
        reply.send({ wins, losses })
    }
    catch (error)
    {
        console.log(`Cannot select wins/losses from database: ${error}`);
        return null;       
    }
}
