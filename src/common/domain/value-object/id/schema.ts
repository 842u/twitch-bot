import { z } from "zod";
import { ZodValidator } from "@/common/infrastructure/validator/zod.js";

const ID_REQUIRED_MESSAGE = "ID is required.";
const ID_TYPE_MESSAGE = "ID must be a UUID.";

export const idSchema = z.uuid({
	error: (issue) => (issue.input === undefined ? ID_REQUIRED_MESSAGE : ID_TYPE_MESSAGE),
});

export const idValidator = new ZodValidator();
