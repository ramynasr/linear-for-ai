import { ListResult } from './types.js';

export class JSONFormatter {
  static format<T>(data: T | ListResult<T>): string {
    return JSON.stringify({ data }, null, 2);
  }
}
