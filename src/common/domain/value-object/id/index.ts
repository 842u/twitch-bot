import { Result } from "@/common/application/result";
import { ValueObject } from "@/common/domain/value-object";
import { idSchema, idValidator } from "@/common/domain/value-object/id/schema";

export class Id extends ValueObject<string> {
	private constructor(value: string) {
		super(value);
	}

	static create(value: string) {
		const result = idValidator.validate(value, idSchema, "ID validation failed.");

		if (!result.success) {
			return Result.fail(result.error);
		}

		return Result.ok(new Id(value));
	}
}
