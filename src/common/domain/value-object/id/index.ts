import { Result } from "@/common/application/result/index.js";
import { idSchema, idValidator } from "@/common/domain/value-object/id/schema.js";
import { ValueObject } from "@/common/domain/value-object/index.js";

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
