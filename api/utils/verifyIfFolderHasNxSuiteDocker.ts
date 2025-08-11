import { Handler } from '../../core/handler.js';
import type { HandlerResponse } from '../../types/handlerResponse.js';
import fs from 'node:fs';
import path from 'path';

type Input = {
  basePath: string;
};

type Output = {
  hasNxSuiteDocker: boolean
};

export default class VerifyIfFolderHasNxSuiteDocker extends Handler<Input, Output> {
  async execute({ basePath }: Input): Promise<HandlerResponse<Output>> {
    try {
      const target = path.join(basePath, 'nx-suite-docker');
      const hasNxSuiteDocker = fs.existsSync(target) && fs.lstatSync(target).isDirectory();
      console.log(`hasNxSuiteDocker: ${hasNxSuiteDocker}`);
      return this.success({
        hasNxSuiteDocker
      })
    } catch(error) {
      console.error(error);
      return this.fail('nx', 'Error checking the nx-suite-docker folder');
    }
  }
}