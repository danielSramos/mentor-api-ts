import { ConsoleLogger, Injectable } from '@nestjs/common';
import pino from 'pino';

@Injectable()
export class LoggerService extends ConsoleLogger {
  private readonly logger: pino.Logger;

  constructor() {
    super();
    this.logger = pino({
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          singleLine: true,
        },
      },
    });
  }

  info(context: any, message: string) {
    this.logger.info(context, message);
  }

  error(context: any, message: string) {
    this.logger.error(context, message);
  }

  warn(context: any, message: string) {
    this.logger.warn(message);
  }

  debug(context: any, message: string) {
    this.logger.debug(message);
  }
}
