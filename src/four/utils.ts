export const assertNever = (_val: never) => {
  throw new Error('should be unreachable');
}

export const get = <T, U extends keyof T>(key: U) => (obj: T): T[U] => obj[key];
