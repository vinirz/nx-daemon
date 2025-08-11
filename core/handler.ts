import type { HandlerResponse } from "../types/handlerResponse.js";

type TagType = "docker" | "git" | "ssh" | "node" | "nx";

export abstract class Handler<TInput = void, TOutput = unknown> {
  abstract execute(input: TInput): Promise<HandlerResponse<TOutput>>;

  protected success(data: TOutput): HandlerResponse<TOutput> {
    return {
      data,
      error: null,
    };
  }

  protected fail(tag: TagType, message: string): HandlerResponse<TOutput> {
    return {
      data: null,
      error: { tag, message },
    };
  }
}
