import { Handler } from "../../core/handler.js";
import type { HandlerResponse } from '../../types/handlerResponse.js';
import DatabaseConnector from "../../core/databaseConnector.js";
import path from "path";
import fs from "node:fs/promises";

type Input = {
  basePath: string
}

type Output = {
  pendingMigrations: string[];
};

const connector = new DatabaseConnector();

export default class CheckPendingMigrations extends Handler<Input, Output> {
    async execute({ basePath }: Input): Promise<HandlerResponse<Output>> {
        try {
            const suitePath = path.join(basePath, 'sources', 'nx-suite-fullbackend');
            const migrationsPath = path.join(suitePath, 'migrations', 'main');

            const migrationsFiles = await fs.readdir(migrationsPath);
            const migrationsNames = migrationsFiles.map(file => path.basename(file, '.js'));

            const connection = await connector.generateConnection();
            const result = await connection.query(`
                    SELECT name FROM pgmigrations
                `);
            const appliedMigrations = result.rows.map(row => row.name);
            const pendingMigrations = migrationsNames.filter(name => !appliedMigrations.includes(name));
            return this.success({
                pendingMigrations
            });
        } catch {
            return this.fail('database', 'Error checking pending migrations');
        }
    }
}