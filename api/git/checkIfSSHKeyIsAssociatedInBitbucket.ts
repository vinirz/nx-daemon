import { Handler } from '../../core/handler.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import type { HandlerResponse } from '../../types/handlerResponse.js';

const execAsync = promisify(exec);

type Output = {
  isAssociated: boolean
};

export default class CheckIfSSHKeyIsAssociatedInBitbucket extends Handler<void, Output> {
  async execute(): Promise<HandlerResponse<Output>> {
    try {
      const { stdout } = await execAsync('ssh -T git@bitbucket.org');
      const isAssociated = stdout.includes('authenticated') || stdout.includes('successfully authenticated');
      return this.success({
        isAssociated
      });
    } catch {
      return this.fail('git', 'Error checking if SSH key is associated in Bitbucket');
    }
  }
}