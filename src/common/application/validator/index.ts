import { z } from "zod";
import type { Result } from "@/common/application/result";

export const validatorIssueSchema = z.object({
	path: z.array(z.union([z.string(), z.symbol(), z.number()])),
	message: z.string(),
});

export type ValidatorIssue = {
	path: Array<string | number | symbol>;
	message: string;
};

export class ValidatorError extends Error {
	readonly issues: ValidatorIssue[];

	constructor(message: string, issues: ValidatorIssue[] = []) {
		super(message);
		this.name = "ValidatorError";
		this.issues = issues;
	}
}

export interface Validator {
	validate<T>(
		value: unknown,
		schema: { _output: T },
		errorMessage?: string,
	): Result<T, ValidatorError>;
}
