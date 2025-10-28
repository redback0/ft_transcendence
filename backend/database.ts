import Database from 'better-sqlite3';

// this class is for caching specific sql statements that will be used often.
class SiteDatabase extends Database
{
    constructor(dbPath: string)
    {
        // better-sqlite3 github recommends setting
        // db.pragma("journal_mode = WAL");
        // not adding this currently, cause I don't think it will matter,
        // but worth thinking about later.
        super(dbPath);
    }

    saveGame = this.prepare(`
        INSERT INTO game VALUES (
        @id, @leftId, @rightId, @tournId, @leftScore, @rightScore, @dateFinished
        );
    `);

    getUserIdFromUsername = this.prepare(`
        SELECT user_id FROM users WHERE username = ?`
    );

    getUsernameFromUserId = this.prepare(`
        SELECT username FROM users WHERE user_id = ?
    `);

    getAllOfAUsersGames = this.prepare(`
        SELECT * FROM game WHERE left_id = ? OR right_id = ?
    `);

}

export const db = new SiteDatabase('/database/pong.db');
