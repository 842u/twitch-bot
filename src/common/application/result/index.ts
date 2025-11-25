type BaseSuccessResult<T> = {
	success: true;
	data: T;
};

type BaseFailureResult<E> = {
	success: false;
	error: E;
};

type SuccessResult<T, U = object> = BaseSuccessResult<T> & U;

type FailureResult<E, U = object> = BaseFailureResult<E> & U;

export type Result<T, E, U = object> = SuccessResult<T, U> | FailureResult<E, U>;

export const Result = {
	ok<T, E = never, U = object>(data: T, metadata?: U): Result<T, E, U> {
		return { success: true, data, metadata };
	},

	fail<T = never, E = unknown, U = object>(error: E, metadata?: U): Result<T, E, U> {
		return { success: false, error, metadata };
	},

	/**
	 * Combines multiple Results into a single Result.
	 * Returns the first failure encountered, or a success with all data values.
	 *
	 * @param results - Array or tuple of Result objects to combine
	 * @returns Result containing array/tuple of all success data, or the first error encountered
	 *
	 * @example
	 * const results = [Result.ok(1), Result.ok(2), Result.ok(3)];
	 * const combined = Result.combine(results);
	 * // combined.success === true, combined.data === [1, 2, 3]
	 *
	 * @example
	 * const combined = Result.combine([
	 *   Result.ok("text"),
	 *   Result.ok(42),
	 *   Result.ok(true)
	 * ] as const);
	 * // combined.success === true, combined.data === ["text", 42, true]
	 */
	combine<T extends readonly Result<unknown, unknown>[]>(
		results: T,
	): Result<
		/**
		 * Create a *mapped type* over the tuple T.
		 * `keyof T` iterates over each index: 0, 1, 2, ...
		 *
		 * For each element T[K], we check:
		 *   Is it a Result<DATA, ERROR>?
		 * If yes, extract the DATA type using `infer D`.
		 *
		 * Example:
		 *   T = [Result<number>, Result<string>, Result<boolean>]
		 *
		 * This produces:
		 *   { 0: number, 1: string, 2: boolean }
		 *
		 * Mapped types preserve tuple structure, so it becomes:
		 *   [number, string, boolean]
		 */
		{ [K in keyof T]: T[K] extends Result<infer D, unknown> ? D : never },
		/**
		 * `T[number]` means “the type of any element of the tuple T”.
		 * If T = [A, B, C], then T[number] = A | B | C.
		 *
		 * Since each element is a Result<unknown, E>,
		 * we extract the ERROR type using `infer E`.
		 *
		 * Example:
		 *   T = [Result<number, "err1">, Result<string, "err2">]
		 *
		 * T[number] =
		 *   Result<number, "err1"> | Result<string, "err2">
		 *
		 * Extracting E from each gives:
		 *   "err1" | "err2"
		 *
		 * So the final error type of the combined Result is:
		 *   union of all possible errors
		 */
		T[number] extends Result<unknown, infer E> ? E : never
	> {
		const data: unknown[] = [];

		for (const result of results) {
			if (!result.success) {
				// biome-ignore lint/suspicious/noExplicitAny: 0
				return result as any;
			}
			data.push(result.data);
		}

		// biome-ignore lint/suspicious/noExplicitAny: 0
		return Result.ok(data) as any;
	},
};
