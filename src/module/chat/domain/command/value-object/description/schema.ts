import { z } from "zod";
import { ZodValidator } from "@/common/infrastructure/validator/zod";

const COMMAND_DESCRIPTION_REQUIRED_MESSAGE = "Description is required.";
const COMMAND_DESCRIPTION_TYPE_MESSAGE = "Description must be a string.";
const MIN_COMMAND_DESCRIPTION_LENGHT = 2;
const MIN_COMMAND_DESCRIPTION_LENGHT_MESSAGE = `Minimum description length is ${MIN_COMMAND_DESCRIPTION_LENGHT}`;
const MAX_COMMAND_DESCRIPTION_LENGHT = 500;
const MAX_COMMAND_DESCRIPTION_LENGHT_MESSAGE = `Maximum description length is ${MAX_COMMAND_DESCRIPTION_LENGHT}`;

export const commandDescriptionSchema = z
	.string({
		error: (issue) =>
			issue.input === undefined
				? COMMAND_DESCRIPTION_REQUIRED_MESSAGE
				: COMMAND_DESCRIPTION_TYPE_MESSAGE,
	})
	.trim()
	.min(MIN_COMMAND_DESCRIPTION_LENGHT, { error: MIN_COMMAND_DESCRIPTION_LENGHT_MESSAGE })
	.max(MAX_COMMAND_DESCRIPTION_LENGHT, { error: MAX_COMMAND_DESCRIPTION_LENGHT_MESSAGE });

export const commandDescriptionValidator = new ZodValidator();
