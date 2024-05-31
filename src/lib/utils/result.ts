export const ok = <T>(data: T) => ({ ok: true, data } as const);
export const error = (error: string) => ({ ok: false, error } as const);
export type Result<T> = ReturnType<typeof ok<T>> | ReturnType<typeof error>;
