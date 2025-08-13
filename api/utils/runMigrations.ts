import { Handler } from "../../core/handler.js";
import type { HandlerResponse } from "../../types/handlerResponse.js";
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

type Input = {
  suitePathLocal: string
}

type Output = {
  success: boolean,
  output: string
};



export default class runMigrations extends Handler<Input, Output> {
    async execute({ suitePathLocal }: Input): Promise<HandlerResponse<Output>> {
        try {
            const { stdout, stderr } = await execAsync('npm run migrate-main up', {
                cwd: suitePathLocal
            })

            const output = stdout || stderr;
            return this.success({
                success: true,
                output: output.trim()
            });
        } catch {
            return this.fail('database', 'Error running migrations');
        }
    }
}
