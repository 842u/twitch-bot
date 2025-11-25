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
	type IrcSource,
	type IrcTags,
} from "@/module/chat/application/irc/types";

class IrcSerializerError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "IrcSerializerError";
	}
}

export class IrcSerializer {
	serialize(message: IrcMessage) {
		const { tags, source, command, parameters } = message;

		const tagsResult = this.serializeTags(tags);
		if (!tagsResult.success) return Result.fail(tagsResult.error);

		const sourceResult = this.serializeSource(source);
		if (!sourceResult.success) return Result.fail(sourceResult.error);

		const commandResult = this.serializeCommand(command);
		if (!commandResult.success) return Result.fail(commandResult.error);

		const parametersResult = this.serializeParameters(parameters);
		if (!parametersResult.success) return Result.fail(parametersResult.error);

		const IrcMessageString =
			`${tagsResult.data}${IRC_SEPARATOR_SYMBOL}${sourceResult.data}${IRC_SEPARATOR_SYMBOL}${commandResult.data}${IRC_SEPARATOR_SYMBOL}${parametersResult}${IRC_TERMINATOR_SYMBOL}`.trim();

		return Result.ok(IrcMessageString);
	}

	private serializeTags(tags?: IrcTags) {
		// https://modern.ircdocs.horse/#tags
		if (!tags || !tags.size) return Result.ok("");

		let tagsSection = IRC_TAGS_SYMBOL;

		tags.forEach((value, key) => {
			const tagString = `${key}=${this.escapeTagValue(value)};`;
			tagsSection += tagString;
		});

		return Result.ok(tagsSection);
	}

	private escapeTagValue(value: string): string {
		// order matters
		return value
			.replace(/\\/g, "\\\\")
			.replace(/ /g, "\\s")
			.replace(/\n/g, "\\n")
			.replace(/\r/g, "\\r")
			.replace(/;/g, "\\:");
	}

	private serializeSource(source?: IrcSource) {
		// https://modern.ircdocs.horse/#source
		if (!source || source.origin === "client") return Result.ok("");
		return Result.ok(`${IRC_SOURCE_SYMBOL}${source.serverName}`);
	}

	private serializeCommand(command: string) {
		// https://modern.ircdocs.horse/#command
		if (!/^[A-Z0-9]+$/.test(command)) {
			return Result.fail(new IrcSerializerError("Command must be alphanumeric."));
		}
		return Result.ok(`${command}`);
	}

	private serializeParameters(parameters?: string[]): Result<string, IrcSerializerError> {
		if (!parameters || !parameters.length) {
			return Result.ok("");
		}

		/**
		 * middle parameters cannot:
		 * - contain spaces
		 * - be empty
		 * - start with ':'
		 */
		for (let i = 0; i < parameters.length - 1; i++) {
			const parameter = parameters[i];
			if (parameter.includes(IRC_SEPARATOR_SYMBOL)) {
				return Result.fail(
					new IrcSerializerError(
						`Parameter at index ${i} contains spaces. Only the last parameter can contain spaces.`,
					),
				);
			}
			if (parameter === "") {
				return Result.fail(
					new IrcSerializerError(
						`Parameter at index ${i} is empty. Only the last parameter can be empty.`,
					),
				);
			}
			if (parameter.startsWith(":")) {
				return Result.fail(
					new IrcSerializerError(
						`Parameter at index ${i} starts with ':'. Only the last parameter can start with ':'.`,
					),
				);
			}
		}

		const lastParameter = parameters[parameters.length - 1];
		const middleParameters = parameters.slice(0, -1);

		const needsTrailing =
			lastParameter.includes(" ") || lastParameter.startsWith(":") || lastParameter === "";

		let parametersSection: string = "";

		if (parameters.length === 1) {
			parametersSection = needsTrailing ? `:${lastParameter}` : lastParameter;
		} else {
			if (needsTrailing) {
				parametersSection = `${middleParameters.join(" ")} :${lastParameter}`;
			} else {
				parametersSection = parameters.join(" ");
			}
		}

		return Result.ok(parametersSection);
	}
}
