import type { HandlerError } from "./handlerError.js";

export type HandlerResponse<T> = {
  data: T | null;
  error: HandlerError | null;
};