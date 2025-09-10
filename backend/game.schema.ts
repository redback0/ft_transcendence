
type UserID = string;

export interface GameInterface
{
	type: string
}

// if players not both taken
// Server >> GameIdentifyRequest
// Client >> GameIdentify
// Server >> GameCanRegister
// ?Client >> GameRegister
// ...

// if players both taken
// Server >> GameCanRegister (both false)
// Client >> GameInfoRequest
// ...

// Server >> Client
export interface GameIdentifyRequest extends GameInterface
{
	type: "identifyRequest"
}

// Client >> Server
export interface GameIdentify extends GameInterface
{
	type: "identify",
	uid: UserID | null,
	sessionToken: string | null // SUBJECT TO CHANGE
}

// Server >> Client
export interface GameCanRegister extends GameInterface
{
	type: "canRegister",
	player1: boolean,
	player2: boolean
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

// Client >> Server
export interface GameInfoRequest extends GameInterface
{
	type: "infoRequest"
}

// Server >> Client
export interface GameInfo extends GameInterface
{
	type: "info",
	started: boolean,
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
	frameTime: EpochTimeStamp,
	ballX: number,
	ballXVel: number,
	ballY: number,
	ballYVel: number,
	player1Y: number,
	player1MoveDir: -1 | 0 | 1,
	player2Y: number,
	player2MoveDir: -1 | 0 | 1
}

// Client >> Server
export interface GameUserInput extends GameInterface
{
	type: "input",
	frameCount: number,
	frameTime: EpochTimeStamp,
	moveUp: boolean,
	moveDown: boolean
}

// Server >> Client (when scored)
export interface GameScoreData extends GameInterface
{
	type: "score",
	scorer: "player1" | "player2",
	p1Score: number,
	p2Score: number,
	ballX: number,
	ballY: number,
	player1Y: number,
	player2Y: number
}

export interface GameWinData extends GameInterface
{
	type: "win",
	winner: "player1" | "player2" | undefined,
	p1Score: number,
	p2Score: number,
	ballX: number,
	ballY: number,
	player1Y: number,
	player2Y: number,
}
