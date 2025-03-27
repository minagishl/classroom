const fontFamily =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

const logger = {
  info: (message: string): void => {
    console.log(`%c[INFO] ${message}`, `font-family: ${fontFamily}`);
  },
  warn: (message: string): void => {
    console.warn(`%c[WARN] ${message}`, `font-family: ${fontFamily}`);
  },
  error: (message: unknown): void => {
    console.error(`%c[ERROR] ${String(message)}`, `font-family: ${fontFamily}`);
  },
  debug: (message: string): void => {
    console.debug(`%c[DEBUG] ${message}`, `font-family: ${fontFamily}`);
  },
  fatal: (message: string): void => {
    console.error(`%c[FATAL] ${message}`, `font-family: ${fontFamily}`);
  },
};

export default logger;
