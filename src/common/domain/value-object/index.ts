import type { Result } from "@/common/application/result/index.js";

export abstract class ValueObject<T> {
	protected readonly _value: T;

	protected constructor(value: T) {
		this._value = value;
	}

	static create(..._: unknown[]): Result<unknown, unknown> {
		throw new Error("Create method of a Value Object not implemented.");
	}

	public get value(): T {
		return this._value;
	}
}
