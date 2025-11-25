import { Result } from "@/common/application/result";
import { ValidatorError, type ValidatorIssue } from "@/common/application/validator";
import { ValueObject } from "@/common/domain/value-object";
import {
	commandDescriptionSchema,
	commandDescriptionValidator,
} from "@/module/chat/domain/command/value-object/description/schema";

class CommandDescriptionError extends ValidatorError {
	constructor(message: string, issues: ValidatorIssue[]) {
		super(message, issues);
		this.name = "CommandDescriptionError";
	}
}

export class CommandDescription extends ValueObject<string> {
	private constructor(value: string) {
		super(value);
	}

	static create(value: string) {
		const result = commandDescriptionValidator.validate(
			value,
			commandDescriptionSchema,
			"ID validation failed.",
		);

		if (!result.success) {
			const { message, issues } = result.error;
			return Result.fail(new CommandDescriptionError(message, issues));
		}

		return Result.ok(new CommandDescription(value));
	}
}
