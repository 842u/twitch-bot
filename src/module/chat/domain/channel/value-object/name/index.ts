import { Result } from "@/common/application/result";
import { ValidatorError, type ValidatorIssue } from "@/common/application/validator";
import { ValueObject } from "@/common/domain/value-object";
import {
	channelNameSchema,
	channelNameValidator,
} from "@/module/chat/domain/channel/value-object/name/schema";

class ChannelNameError extends ValidatorError {
	constructor(message: string, issues: ValidatorIssue[]) {
		super(message, issues);
		this.name = "CommandNameError";
	}
}

export class ChannelName extends ValueObject<string> {
	private constructor(value: string) {
		super(value);
	}

	static create(value: string) {
		const result = channelNameValidator.validate(value, channelNameSchema);

		if (!result.success) {
			const { message, issues } = result.error;
			return Result.fail(new ChannelNameError(message, issues));
		}

		return Result.ok(new ChannelName(value));
	}
}
