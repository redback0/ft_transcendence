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
        @id, @leftId, @rightId, @tournId, @leftScore, @rightScore
        );
    `);

    getUserIdFromUsername = this.prepare(`
        SELECT user_id FROM users WHERE username = ?`
    );

}

export const db = new SiteDatabase('/database/pong.db');
