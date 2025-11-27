import { z } from "zod";
import { ZodValidator } from "@/common/infrastructure/validator/zod";

const CHANNEL_NAME_REQUIRED_MESSAGE = "Name is required.";
const CHANNEL_NAME_TYPE_MESSAGE = "Name must be a string.";
const MIN_CHANNEL_NAME_LENGHT = 4;
const MIN_CHANNEL_NAME_LENGHT_MESSAGE = `Minimum name length is ${MIN_CHANNEL_NAME_LENGHT}`;
const MAX_CHANNEL_NAME_LENGHT = 25;
const MAX_CHANNEL_NAME_LENGHT_MESSAGE = `Maximum name length is ${MAX_CHANNEL_NAME_LENGHT}`;
const CHANNEL_REGEX_MESSAGE = "Name can contain only lowercase letters, numbers and underscores.";

export const channelNameSchema = z
	.string({
		error: (issue) =>
			issue.input === undefined ? CHANNEL_NAME_REQUIRED_MESSAGE : CHANNEL_NAME_TYPE_MESSAGE,
	})
	.trim()
	.min(MIN_CHANNEL_NAME_LENGHT, { error: MIN_CHANNEL_NAME_LENGHT_MESSAGE })
	.max(MAX_CHANNEL_NAME_LENGHT, { error: MAX_CHANNEL_NAME_LENGHT_MESSAGE })
	.regex(/^[a-z0-9_]$/, { error: CHANNEL_REGEX_MESSAGE });

export const channelNameValidator = new ZodValidator();
