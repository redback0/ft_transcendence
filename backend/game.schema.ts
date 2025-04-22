
export interface GameInterface
{
	type: string
}

// Client >> Server
export interface GameRegister
{
	type: "register"
}

// Server >> Client
export interface GameRegisterResponse
{
	type: "registerSuccess",
	success: boolean,
	position: "player1" | "player2" | undefined
}

// Server >> Client
export interface GameInfo
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
export interface GameStart
{
	type: "start"
}

// Server >> Client
export interface GameFrameData
{
	type: "frame",
	frameCount: number,
	ballX: number,
	ballY: number,
	player1Y: number,
	player2Y: number
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

export interface GameWinData
{
	type: "win",
	winner: "plaer1" | "player2",
	p1Score: number,
	p2Score: number
}