import { z } from "zod";
import { ZodValidator } from "@/common/infrastructure/validator/zod";

const COMMAND_NAME_REQUIRED_MESSAGE = "Name is required.";
const COMMAND_NAME_TYPE_MESSAGE = "Name must be a string.";
const MIN_COMMAND_NAME_LENGHT = 2;
const MIN_COMMAND_NAME_LENGHT_MESSAGE = `Minimum name length is ${MIN_COMMAND_NAME_LENGHT}`;
const MAX_COMMAND_NAME_LENGHT = 50;
const MAX_COMMAND_NAME_LENGHT_MESSAGE = `Maximum name length is ${MAX_COMMAND_NAME_LENGHT}`;

export const commandNameSchema = z
	.string({
		error: (issue) =>
			issue.input === undefined ? COMMAND_NAME_REQUIRED_MESSAGE : COMMAND_NAME_TYPE_MESSAGE,
	})
	.trim()
	.min(MIN_COMMAND_NAME_LENGHT, { error: MIN_COMMAND_NAME_LENGHT_MESSAGE })
	.max(MAX_COMMAND_NAME_LENGHT, { error: MAX_COMMAND_NAME_LENGHT_MESSAGE });

export const commandNameValidator = new ZodValidator();
