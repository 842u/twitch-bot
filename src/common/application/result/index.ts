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
};
