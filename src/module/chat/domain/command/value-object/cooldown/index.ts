import { Result } from "@/common/application/result";
import { ValidatorError, type ValidatorIssue } from "@/common/application/validator";
import { ValueObject } from "@/common/domain/value-object";
import {
	commandCooldownSchema,
	commandCooldownValidator,
} from "@/module/chat/domain/command/value-object/cooldown/schema";

type CommandCooldownValue = {
	duration: number;
	isGlobal: boolean;
};

class CommandCooldownError extends ValidatorError {
	constructor(message: string, issues: ValidatorIssue[]) {
		super(message, issues);
		this.name = "CommandCooldownError";
	}
}

export class CommandCooldown extends ValueObject<CommandCooldownValue> {
	private constructor(value: { duration: number; isGlobal: boolean }) {
		super(value);
	}

	static create(value: { duration: number; isGlobal: boolean }) {
		const result = commandCooldownValidator.validate(value, commandCooldownSchema);

		if (!result.success) {
			const { message, issues } = result.error;
			return Result.fail(new CommandCooldownError(message, issues));
		}

		return Result.ok(new CommandCooldown(value));
	}
}
