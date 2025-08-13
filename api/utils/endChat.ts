import { Handler } from "../../core/handler.js";
import type { HandlerResponse } from "../../types/handlerResponse.js";
import os from 'node:os';
import { exec } from 'child_process';

type Input = {
    chatId: string,
    suitePathLocal: string
}

type Output = {
    success: boolean,
    error?: boolean | null
}

export default class endChat extends Handler<Input, Output> {
    async execute({ chatId, suitePathLocal }: Input): Promise<HandlerResponse<Output>> {
        try {
            if (!chatId) {
                return this.fail('nx', 'Invalid chat ID');
            }

            const scriptPath = suitePathLocal!.split('/sources/nx-suite-fullbackend')[0];
            const isWindows = os.platform() === 'win32';
            return new Promise((resolve, reject) => {
                const command = isWindows
                    ? `cd ${scriptPath}\\lib\\scripts\\nx\\endChat && node app.js ${chatId}`
                    : `cd ${scriptPath}/lib/scripts/nx/endChat && node app.js ${chatId}`;

                exec (command, (error, stdout) => {
                    if (error) {
                        console.error('Erro ao executar o script: ', error);
                        resolve(this.fail('nx', 'Error executing endChat script'));
                    } else {
                        console.log('Script executado com sucesso:', stdout);
                        resolve(this.success({
                            success: true,
                            error: null
                        }))
                    }
                })
            });
            
        } catch {
            return this.fail('nx', 'Error ending chat');
        }
    }

}