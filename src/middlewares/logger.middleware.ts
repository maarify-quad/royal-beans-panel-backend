import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggerMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    this.logger.verbose(
      `Requesting: ${req.originalUrl} with ${req.method} method from ${req.ip} address.`,
    );

    res.on('close', () => {
      this.logger.debug(
        `Response closed with status code ${res.statusCode} and status message ${res.statusMessage}.`,
      );
    });

    next();
  }
}
