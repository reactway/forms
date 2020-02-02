export const LOGGER_PREFIX = "Reactway-Forms:";

class Logger {
    protected multiline(...args: any[]): any[] {
        const result = [];
        for (const arg of args) {
            result.push(arg);
            result.push("\n");
        }
        result.splice(result.length - 1, 1);
        return result;
    }

    public log(...args: any[]): void {
        console.log(...this.multiline(LOGGER_PREFIX, ...args));
    }

    public warn(...args: any[]): void {
        console.warn(...this.multiline(LOGGER_PREFIX, ...args));
    }

    public error(...args: any[]): void {
        console.error(...this.multiline(LOGGER_PREFIX, ...args));
    }

    public info(...args: any[]): void {
        console.info(...this.multiline(LOGGER_PREFIX, ...args));
    }
}

export const formsLogger = new Logger();
