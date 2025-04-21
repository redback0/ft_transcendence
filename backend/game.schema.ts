
export interface GameComponent
{
	x: number,
	y: number
}

export interface GameInterface
{
	type: string
}

export interface GameInfo
{
	type: "info",
	gameWidth: number,
	gameHeight: number,
	batHeight: number,
	batSpeed: number,
	p1Color: number | undefined,
	p2Color: number | undefined,
	ballSize: number,
	ballSpeed: number,
	ballAcel: number
}

// Server >> Client
export interface GameFrameData
{
	type: "frame",
	frameCount: number,
	ball: GameComponent,
	player1: GameComponent,
	player2: GameComponent
}

// Client >> Server
export interface GameUserInput
{
	type: "input",
	frameCount: number,
	moveUp: boolean,
	moveDown: boolean
}

// Server >> Client (when scored)
export interface GameScoreData
{
	type: "score",
	scorer: "player1" | "player2",
	p1Score: number,
	p2Score: number
}
