import { Result } from "@/common/application/result";
import { Entity } from "@/common/domain/entity";
import { ChannelId } from "@/module/chat/domain/channel/value-object/id";
import { ChannelName } from "@/module/chat/domain/channel/value-object/name";
import { ChannelPlatformId } from "@/module/chat/domain/channel/value-object/platform-id";
import type { Command } from "@/module/chat/domain/command/command";

type ChannelValue = {
	id: ChannelId;
	name: ChannelName;
	platformId: ChannelPlatformId;
	commands: Command[];
};

export class Channel extends Entity<ChannelValue> {
	private constructor(value: ChannelValue) {
		super(value);
	}

	static create(value: { id: string; name: string; platformId: string; commands: Command[] }) {
		const combinedResult = Result.combine([
			ChannelId.create(value.id),
			ChannelName.create(value.name),
			ChannelPlatformId.create(value.platformId),
		]);

		if (!combinedResult.success) return Result.fail(combinedResult.error);

		const [id, name, platformId] = combinedResult.data;

		return Result.ok(
			new Channel({
				id,
				name,
				platformId,
				commands: value.commands,
			}),
		);
	}
}
