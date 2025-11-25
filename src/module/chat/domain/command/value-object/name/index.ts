import { Result } from "@/common/application/result";
import { ValidatorError, type ValidatorIssue } from "@/common/application/validator";
import { ValueObject } from "@/common/domain/value-object";
import {
	commandNameSchema,
	commandNameValidator,
} from "@/module/chat/domain/command/value-object/name/schema";

export class CommandNameError extends ValidatorError {
	constructor(message: string, issues: ValidatorIssue[]) {
		super(message, issues);
		this.name = "CommandNameError";
	}
}

export class CommandName extends ValueObject<string> {
	private constructor(value: string) {
		super(value);
	}

	static create(value: string) {
		const result = commandNameValidator.validate(value, commandNameSchema);

		if (!result.success) {
			const { message, issues } = result.error;
			return Result.fail(new CommandNameError(message, issues));
		}

		return Result.ok(new CommandName(value));
	}
}
