export type ChatClientSendMessage = {
	type: "send_message",
	data: {
		payload: string,
		reciever: string
		is_invite: boolean,
	},
}

export type ChatClientRecieveDirectMessage = {
	type: "recieve_direct_message",
	data: {
		payload: string,
		sender: string,
		is_invite: boolean,
	}
}

export type ChatClientRecieveChannelMessage = {
	type: "recieve_channel_message",
	data: {
		payload: string,
		sender: string,
		channel: string,
		is_invite: boolean,
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