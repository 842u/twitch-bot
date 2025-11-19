import type { Result } from "@/common/application/result/index.js";
import type { Id } from "@/common/domain/value-object/id/index.js";

type BaseEntityValue = { id: Id };

export abstract class Entity<T extends BaseEntityValue> {
	protected readonly _value: T;

	protected constructor(value: T) {
		this._value = Object.seal(value);
	}

	static create(..._: unknown[]): Result<unknown, unknown> {
		throw new Error("Create method of an Entity not implemented.");
	}

	public get value(): T {
		return this._value;
	}

	public get id(): Id {
		return this.value.id;
	}
}
