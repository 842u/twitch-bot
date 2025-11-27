import { Result } from "@/common/application/result";
import { ValueObject } from "@/common/domain/value-object";
import { Id } from "@/common/domain/value-object/id";

export class ChannelId extends ValueObject<string> {
	private constructor(value: string) {
		super(value);
	}

	static create(value: string) {
		const idResult = Id.create(value);

		if (!idResult.success) {
			return Result.fail(idResult.error);
		}

		return Result.ok(new ChannelId(idResult.data.value));
	}
}
