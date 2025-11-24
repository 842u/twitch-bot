export const IRC_SEPARATOR_SYMBOL = " ";
export const IRC_TAGS_SYMBOL = "@";
export const IRC_SOURCE_SYMBOL = ":";
export const IRC_TERMINATOR_SYMBOL = "\r\n";

export type IrcTags = Map<string, string>;

export type IrcSource =
	| {
			origin: "client";
			nickname: string;
			user: string;
			host: string;
	  }
	| { origin: "server"; serverName: string };

export type IrcMessage = {
	tags?: IrcTags;
	source?: IrcSource;
	command: string;
	parameters?: string[];
};
