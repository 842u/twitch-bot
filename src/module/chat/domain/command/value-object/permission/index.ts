import { Result } from "@/common/application/result";
import { ValidatorError, type ValidatorIssue } from "@/common/application/validator";
import { ValueObject } from "@/common/domain/value-object";
import { commandDescriptionSchema } from "@/module/chat/domain/command/value-object/description/schema";
import { commandPermissionValidator } from "@/module/chat/domain/command/value-object/permission/schema";

class CommandPermissionError extends ValidatorError {
	constructor(message: string, issues: ValidatorIssue[]) {
		super(message, issues);
		this.name = "CommandPermissionError";
	}
}

export class CommandPermission extends ValueObject<string> {
	private constructor(value: string) {
		super(value);
	}

	static create(value: string) {
		const result = commandPermissionValidator.validate(value, commandDescriptionSchema);

		if (!result.success) {
			const { message, issues } = result.error;
			return Result.fail(new CommandPermissionError(message, issues));
		}

		return Result.ok(new CommandPermission(value));
	}
}
