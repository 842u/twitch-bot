import { Result } from "@/common/application/result";
import { ValueObject } from "@/common/domain/value-object";

class ChannelPlatformIdError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "ChannelPlatformIdError";
	}
}

export class ChannelPlatformId extends ValueObject<string> {
	private constructor(value: string) {
		super(value);
	}

	static create(value: string) {
		if (!/^[0-9]+$/.test(value)) {
			return Result.fail(
				new ChannelPlatformIdError("Channel plarform ID should contain only numbers."),
			);
		}

		return Result.ok(new ChannelPlatformId(value));
	}
}
