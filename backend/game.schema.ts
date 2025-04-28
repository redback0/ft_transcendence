
export interface GameInterface
{
	type: string
}

// Client >> Server
export interface GameRegister extends GameInterface
{
	type: "register"
}

// Server >> Client
export interface GameRegisterResponse extends GameInterface
{
	type: "registerSuccess",
	success: boolean,
	position: "player1" | "player2" | undefined
}

// Server >> Client
export interface GameInfo extends GameInterface
{
	type: "info",
	gameWidth: number,
	gameHeight: number,
	framerate: number,
	batHeight: number,
	batSpeed: number,
	p1Color: string | undefined,
	p2Color: string | undefined,
	ballRadius: number,
	ballSpeed: number,
	ballAcel: number
}

// Server >> Client
export interface GameStart extends GameInterface
{
	type: "start"
}

// Server >> Client
export interface GameFrameData extends GameInterface
{
	type: "frame",
	frameCount: number,
	ballX: number,
	ballY: number,
	player1Y: number,
	player2Y: number
}

// Client >> Server
export interface GameUserInput extends GameInterface
{
	type: "input",
	frameCount: number,
	moveUp: boolean,
	moveDown: boolean
}

// Server >> Client (when scored)
export interface GameScoreData extends GameInterface
{
	type: "score",
	scorer: "player1" | "player2",
	p1Score: number,
	p2Score: number
}

export interface GameWinData extends GameInterface
{
	type: "win",
	winner: "player1" | "player2",
	p1Score: number,
	p2Score: number
}
