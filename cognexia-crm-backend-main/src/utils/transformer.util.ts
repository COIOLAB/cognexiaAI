import { plainToClass, classToPlain } from 'class-transformer';
import { ClassConstructor } from 'class-transformer/types/interfaces';

/**
 * Transform plain object to class instance
 */
export function toClass<T, V>(cls: ClassConstructor<T>, plain: V | V[]): T | T[] {
  return plainToClass(cls, plain, { excludeExtraneousValues: true });
}

/**
 * Transform class instance to plain object
 */
export function toPlain<T>(instance: T | T[]): Record<string, any> | Record<string, any>[] {
  return classToPlain(instance);
}

/**
 * Remove null and undefined values from object
 */
export function removeNullish<T extends Record<string, any>>(obj: T): Partial<T> {
  const result: any = {};

  Object.keys(obj).forEach((key) => {
    if (obj[key] !== null && obj[key] !== undefined) {
      result[key] = obj[key];
    }
  });

  return result;
}

/**
 * Pick specific properties from object
 */
export function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[],
): Pick<T, K> {
  const result: any = {};

  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });

  return result;
}

/**
 * Omit specific properties from object
 */
export function omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> {
  const result: any = { ...obj };

  keys.forEach((key) => {
    delete result[key];
  });

  return result;
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Merge objects deeply
 */
export function deepMerge<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T {
  if (!sources.length) return target;

  const source = sources.shift();

  if (source) {
    Object.keys(source).forEach((key) => {
      const sourceValue = source[key];
      const targetValue = target[key];

      if (isObject(sourceValue) && isObject(targetValue)) {
        (target as any)[key] = deepMerge({ ...targetValue }, sourceValue);
      } else {
        (target as any)[key] = sourceValue as any;
      }
    });
  }

  return deepMerge(target, ...sources);
}

/**
 * Check if value is plain object
 */
function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Flatten nested object
 */
export function flatten(obj: Record<string, any>, prefix: string = ''): Record<string, any> {
  const result: Record<string, any> = {};

  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (isObject(value)) {
      Object.assign(result, flatten(value, newKey));
    } else {
      result[newKey] = value;
    }
  });

  return result;
}

/**
 * Group array by property
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

/**
 * Convert object keys to camelCase
 */
export function keysToCamelCase<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};

  Object.keys(obj).forEach((key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = obj[key];
  });

  return result;
}

/**
 * Convert object keys to snake_case
 */
export function keysToSnakeCase<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};

  Object.keys(obj).forEach((key) => {
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    result[snakeKey] = obj[key];
  });

  return result;
}

/**
 * Map array to object by key
 */
export function arrayToMap<T>(array: T[], key: keyof T): Record<string, T> {
  return array.reduce((result, item) => {
    result[String(item[key])] = item;
    return result;
  }, {} as Record<string, T>);
}
