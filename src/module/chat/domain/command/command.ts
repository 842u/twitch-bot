import { Result } from "@/common/application/result";
import { Entity } from "@/common/domain/entity";
import { CommandCooldown } from "@/module/chat/domain/command/value-object/cooldown";
import { CommandDescription } from "@/module/chat/domain/command/value-object/description";
import { CommandId } from "@/module/chat/domain/command/value-object/id";
import { CommandName, type CommandNameError } from "@/module/chat/domain/command/value-object/name";
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
		description: string;
	}) {
		const idResult = CommandId.create(value.id);
		if (!idResult.success) return Result.fail(idResult.error);

		const nameResult = CommandName.create(value.name);
		if (!nameResult.success) return Result.fail(nameResult.error);

		const permissionResult = CommandPermission.create(value.permission);
		if (!permissionResult.success) return Result.fail(permissionResult.error);

		const cooldownResult = CommandCooldown.create(value.cooldown);
		if (!cooldownResult.success) return Result.fail(cooldownResult.error);

		const aliasesResult: Result<CommandName, CommandNameError>[] = [];
		value.aliases?.forEach((alias) => {
			aliasesResult.push(CommandName.create(alias));
		});
		const aliasFailResult = aliasesResult.find((alias) => !alias.success);
		if (aliasFailResult) return Result.fail(aliasFailResult.error);
		const aliases = aliasesResult
			.filter((alias) => alias.success)
			.map((successAlias) => successAlias.data);

		const descriptionResult = CommandDescription.create(value.description);
		if (!descriptionResult.success) return Result.fail(descriptionResult.error);

		return Result.ok(
			new Command({
				id: idResult.data,
				name: nameResult.data,
				permission: permissionResult.data,
				cooldown: cooldownResult.data,
				aliases,
			}),
		);
	}
}
