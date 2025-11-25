import z from "zod";
import { ZodValidator } from "@/common/infrastructure/validator/zod";

const COOLDOWN_DURATION_REQUIRED_MESSAGE = "Cooldown duration is required.";
const COOLDOWN_DURATION_TYPE_MESSAGE = "Cooldown duration must be a number.";
const cooldownDurationSchema = z
	.number({
		error: (issue) =>
			issue.input === undefined
				? COOLDOWN_DURATION_REQUIRED_MESSAGE
				: COOLDOWN_DURATION_TYPE_MESSAGE,
	})
	.int({ error: "Cooldown duration must be an integer." });

const COOLDOWN_IS_GLOBAL_REQUIRED_MESSAGE = "Cooldown global flag is required.";
const COOLDOWN_IS_GLOBAL_TYPE_MESSAGE = "Cooldown global flag must be a boolean.";
const cooldownIsGlobalSchema = z.boolean({
	error: (issue) =>
		issue.input === undefined
			? COOLDOWN_IS_GLOBAL_REQUIRED_MESSAGE
			: COOLDOWN_IS_GLOBAL_TYPE_MESSAGE,
});

export const commandCooldownSchema = z.object({
	duration: cooldownDurationSchema,
	isGlobal: cooldownIsGlobalSchema,
});

export const commandCooldownValidator = new ZodValidator();
