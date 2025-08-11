import { Handler } from '../../core/handler.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import type { HandlerResponse } from '../../types/handlerResponse.js';

const execAsync = promisify(exec);

type Input = {
  repository: string;
  path: string;
};

type Output = {
  cloned: boolean;
};

export default class CloneRepository extends Handler<Input, Output> {
  async execute({ repository, path }: Input): Promise<HandlerResponse<Output>> {
    try {
      console.log(`Cloning repository ${repository} to ${path}`);
      await execAsync(`git clone ${repository} "${path}"`);

      return this.success({
        cloned: true,
      });
    } catch {
      return this.fail('git', 'Error cloning repository');
    }
  }
}