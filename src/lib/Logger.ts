export class Logger {
  constructor(private name: string) {}

  info(message?: any, ...optionalParams: any[]): void {
    console.info(this.buildMessage('INFO', message), ...optionalParams);
  }

  error(message?: any, ...optionalParams: any[]): void {
    console.error(this.buildMessage('ERROR', message), ...optionalParams);
  }

  debug(message?: any, ...optionalParams: any[]): void {
    if (process.env.NODE_ENV == 'development')
      console.debug(this.buildMessage('DEBUG', message), ...optionalParams);
  }

  warn(message?: any, ...optionalParams: any[]): void {
    console.warn(this.buildMessage('WARN', message), ...optionalParams);
  }

  private buildMessage(operation: string, message: any): string {
    return `[${operation}][${this.name}] ${message}`;
  }
}
