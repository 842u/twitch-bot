import z from "zod";
import { ZodValidator } from "@/common/infrastructure/validator/zod";

const commandPermissionMap = {
	EVERYONE: 0,
	SUBSCRIBER: 1,
	VIP: 2,
	MODERATOR: 3,
	BROADCASTER: 4,
	ADMIN: 5,
} as const;

const commandPermissionKeys = Object.keys(commandPermissionMap) as [
	keyof typeof commandPermissionMap,
];

const COMMAND_PERMISSION_REQUIRED_MESSAGE = "Permission is required.";
const COMMAND_PERMISSION_TYPE_MESSAGE = `Permission must be: ${commandPermissionKeys.join(" ")}`;

export const commandPermissionSchema = z.enum(commandPermissionKeys, {
	error: (issue) =>
		issue.input === undefined
			? COMMAND_PERMISSION_REQUIRED_MESSAGE
			: COMMAND_PERMISSION_TYPE_MESSAGE,
});

export const commandPermissionValidator = new ZodValidator();
