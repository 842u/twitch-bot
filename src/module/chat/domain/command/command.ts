import { Result } from "@/common/application/result";
import { Entity } from "@/common/domain/entity";
import { CommandCooldown } from "@/module/chat/domain/command/value-object/cooldown";
import { CommandDescription } from "@/module/chat/domain/command/value-object/description";
import { CommandId } from "@/module/chat/domain/command/value-object/id";
import { CommandName } from "@/module/chat/domain/command/value-object/name";
import { CommandPermission } from "@/module/chat/domain/command/value-object/permission";

type CommandValue = {
	id: CommandId;
	name: CommandName;
	permission: CommandPermission;
	cooldown: CommandCooldown;
	aliases?: CommandName[];
	description?: CommandDescription;
};

export class Command extends Entity<CommandValue> {
	private constructor(value: CommandValue) {
		super(value);
	}

	static create(value: {
		id: string;
		name: string;
		permission: string;
		cooldown: { duration: number; isGlobal: boolean };
		aliases?: string[];
		description?: string;
	}) {
		const combinedResult = Result.combine([
			CommandId.create(value.id),
			CommandName.create(value.name),
			CommandPermission.create(value.permission),
			CommandCooldown.create(value.cooldown),
			value.description ? CommandDescription.create(value.description) : Result.ok(undefined),
		] as const);

		if (!combinedResult.success) return Result.fail(combinedResult.error);

		const [id, name, permission, cooldown, description] = combinedResult.data;

		let aliases: CommandName[] | undefined;
		if (value.aliases) {
			const aliasesResult = value.aliases.map((alias) => CommandName.create(alias));
			const combinedAliases = Result.combine(aliasesResult);
			if (!combinedAliases.success) return Result.fail(combinedAliases.error);
			aliases = combinedAliases.data;
		}

		return Result.ok(
			new Command({
				id,
				name,
				permission,
				cooldown,
				aliases,
				description,
			}),
		);
	}
}
