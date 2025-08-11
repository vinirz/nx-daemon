import logger from "node-color-log";

class Logger {

  log(message: string) {
    logger.log(message);
  }
  
  success(message: string) {
    logger.color('green').log('✅ ' + message);
  }

  error(message: string) {
    logger.color('red').log('❌ ' + message);
  }

  warn(message: string) {
    logger.color('yellow').log('⚠️  ' + message);
  }
}

export default new Logger();