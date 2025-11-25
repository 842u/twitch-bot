import type { z } from "zod";
import { Result } from "@/common/application/result";
import { type Validator, ValidatorError } from "@/common/application/validator";

export class ZodValidator implements Validator {
	validate<T>(value: unknown, schema: z.ZodSchema<T>, errorMessage: string = "Validation failed.") {
		const result = schema.safeParse(value);

		if (!result.success) {
			const { error } = result;

			const issues = error.issues.map((issue) => ({
				path: issue.path,
				message: issue.message,
			}));

			return Result.fail(new ValidatorError(errorMessage, issues));
		}

		return Result.ok(result.data);
	}
}
