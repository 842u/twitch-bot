/**
 * IRC message format: https://modern.ircdocs.horse/#message-format
 * Message tags format: https://ircv3.net/specs/extensions/message-tags.html
 */

import { Result } from "@/common/application/result";
import {
	IRC_SEPARATOR_SYMBOL,
	IRC_SOURCE_SYMBOL,
	IRC_TAGS_SYMBOL,
	IRC_TERMINATOR_SYMBOL,
	type IrcMessage,
} from "@/module/chat/application/irc/types";

class IrcParserError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "IrcParserError";
	}
}

export class IrcParser {
	private cursorIndex: number = 0;

	parse(data: string): Result<IrcMessage, IrcParserError> {
		this.cursorIndex = 0;

		const message = data.replace(IRC_TERMINATOR_SYMBOL, "");

		const tagsResult = this.parseTags(message);
		if (!tagsResult.success) return Result.fail(tagsResult.error);

		const sourceResult = this.parseSource(message);
		if (!sourceResult.success) return Result.fail(sourceResult.error);

		const commandResult = this.parseCommand(message);
		if (!commandResult.success) return Result.fail(commandResult.error);

		const parametersResult = this.parseParameters(message);
		if (!parametersResult.success) return Result.fail(parametersResult.error);

		return Result.ok({
			tags: tagsResult.data,
			source: sourceResult.data,
			command: commandResult.data,
			parameters: parametersResult.data,
		});
	}

	private parseTags(data: string) {
		// https://modern.ircdocs.horse/#tags
		const haveTags = data.at(this.cursorIndex) === IRC_TAGS_SYMBOL;

		if (!haveTags) return Result.ok(undefined);

		const spaceIndex = data.indexOf(IRC_SEPARATOR_SYMBOL, this.cursorIndex);
		if (spaceIndex === -1) {
			return Result.fail(
				new IrcParserError("Tags parsing error: enclosing space character missing."),
			);
		}

		const tagsSection = data.slice(this.cursorIndex + 1, spaceIndex);
		this.cursorIndex = spaceIndex;

		const tags: Map<string, string> = new Map();

		tagsSection.split(";").forEach((tagString) => {
			const [key, value = ""] = tagString.split("=");
			tags.set(key, this.unescapeTagValue(value));
		});

		return Result.ok(tags);
	}

	private unescapeTagValue(data: string) {
		// https://ircv3.net/specs/extensions/message-tags.html#escaping-values
		return data
			.replace(/\\s/g, IRC_SEPARATOR_SYMBOL)
			.replace(/\\n/g, "\n")
			.replace(/\\r/g, "\r")
			.replace(/\\:/g, ";")
			.replace(/\\\\/g, "\\");
	}

	private parseSource(data: string) {
		// https://modern.ircdocs.horse/#source
		this.moveCursor(data);

		const haveSource = data.at(this.cursorIndex) === IRC_SOURCE_SYMBOL;

		if (!haveSource) return Result.ok(undefined);

		const spaceIndex = data.indexOf(IRC_SEPARATOR_SYMBOL, this.cursorIndex);
		if (spaceIndex === -1) {
			return Result.fail(
				new IrcParserError("Source parsing error: enclosing space character missing."),
			);
		}

		const sourceSection = data.slice(this.cursorIndex + 1, spaceIndex);
		this.cursorIndex = spaceIndex;

		if (sourceSection.includes("!") && sourceSection.includes("@")) {
			const [nickname, rest] = sourceSection.split("!");
			const [user, host] = rest.split("@");
			const source = { origin: "client", nickname, user, host } as const;
			return Result.ok(source);
		}

		const source = { origin: "server", serverName: sourceSection } as const;
		return Result.ok(source);
	}

	private parseCommand(data: string) {
		// https://modern.ircdocs.horse/#command
		this.moveCursor(data);

		let spaceIndex = data.indexOf(IRC_SEPARATOR_SYMBOL, this.cursorIndex);

		// no space = message end
		if (spaceIndex === -1) {
			spaceIndex = data.length;
		}

		const command = data.slice(this.cursorIndex, spaceIndex).toUpperCase();
		this.cursorIndex = spaceIndex;

		if (!/^[A-Z0-9]+$/.test(command)) {
			return Result.fail(new IrcParserError("Command parsing error: invalid command format."));
		}

		return Result.ok(command);
	}

	private parseParameters(data: string) {
		// https://modern.ircdocs.horse/#parameters
		this.moveCursor(data);

		if (this.cursorIndex >= data.length) {
			// end of the message reached
			return Result.ok(undefined);
		}

		const parametersSection = data.slice(this.cursorIndex);
		const params: string[] = [];

		if (parametersSection.startsWith(":")) {
			// ":" = trailing parameter only
			params.push(parametersSection.slice(1));
			return Result.ok(params);
		}

		const trailingIndex = parametersSection.indexOf(" :");

		if (trailingIndex === -1) {
			// no " :" = middle parameteres only
			const middleParams = parametersSection
				.split(IRC_SEPARATOR_SYMBOL)
				.filter((p) => p.length > 0);
			if (middleParams.length > 0) {
				params.push(...middleParams);
			}
		} else {
			const middleSection = parametersSection.slice(0, trailingIndex);
			const middleParams = middleSection.split(IRC_SEPARATOR_SYMBOL).filter((p) => p.length > 0);
			params.push(...middleParams);
			params.push(parametersSection.slice(trailingIndex + 2));
		}

		return Result.ok(params.length > 0 ? params : undefined);
	}

	private moveCursor(data: string, separator: string = IRC_SEPARATOR_SYMBOL) {
		while (data.at(this.cursorIndex) === separator) {
			this.cursorIndex++;
		}
	}
}
