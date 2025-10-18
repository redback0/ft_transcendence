export type ChatClientSendMessage = {
	type: "send_message",
	data: {
		payload: string,
		reciever: string
	},
}

export type ChatClientRecieveDirectMessage = {
	type: "recieve_direct_message",
	data: {
		payload: string,
		sender: string,
	}
}

export type ChatClientRecieveChannelMessage = {
	type: "recieve_channel_message",
	data: {
		payload: string,
		sender: string,
		channel: string,
	}
}

export type ChatInfoMessage = {
	type: "info",
	data: {

	}
}

export type ChatYourNameIs = {
	type: "your_name",
	data: {
		ya_name: string,
	}
}

export type ChatServerMessage = ChatYourNameIs | ChatClientRecieveChannelMessage | ChatClientRecieveDirectMessage;
export type ChatClientMessage = ChatClientSendMessage;