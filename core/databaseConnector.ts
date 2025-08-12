import { Pool } from 'pg';

declare global {
  var databaseConnection: Pool | undefined;
}

class DatabaseConnector {
  async configureConnection(): Promise<Pool> {
    if (!global.databaseConnection) {
      global.databaseConnection = new Pool({
        user: "nxsuitedev",
        host: "pg-local.smartnx.io",
        database: "nxsuitedev",
        password: "passlocal",
        port: 15433,
        max: 2
      });
    }


    return global.databaseConnection;
  }

  async generateConnection(): Promise<Pool> {
    return Promise.resolve(this.configureConnection());
  }
}

export default DatabaseConnector;
