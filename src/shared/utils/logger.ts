export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    NONE = 4
  }

  type LoggerConfig = {
    level: LogLevel;
    enableTimestamps: boolean;
    enableConsole: boolean;
  };
  
  const defaultConfig: LoggerConfig = {
    level: process.env.NODE_ENV === 'production' ? LogLevel.ERROR : LogLevel.DEBUG,
    enableTimestamps: true,
    enableConsole: true
  };
  
  const createLogger = (initialConfig: LoggerConfig = defaultConfig) => {
    const configRef = { current: { ...initialConfig } };
    
    const configure = (newConfig: Partial<LoggerConfig>): void => {
      configRef.current = { ...configRef.current, ...newConfig };
    };
    
    const formatMessage = (level: string, message: string): string => {
      const { enableTimestamps } = configRef.current;
      const timestamp = enableTimestamps ? `[${new Date().toISOString()}] ` : '';
      return `${timestamp}[${level}] ${message}`;
    };
    
    const shouldLog = (messageLevel: LogLevel): boolean => {
      const { level, enableConsole } = configRef.current;
      return enableConsole && messageLevel >= level;
    };
    
    const createLoggerForLevel = (
      levelName: string, 
      messageLevel: LogLevel,
      logFn: (message: string, ...args: any[]) => void
    ) => (message: string, ...args: any[]): void => {
      if (!shouldLog(messageLevel)) return;
      
      logFn(formatMessage(levelName, message), ...args);
    };
    
    const debug = createLoggerForLevel('DEBUG', LogLevel.DEBUG, console.debug);
    const info = createLoggerForLevel('INFO', LogLevel.INFO, console.info);
    const warn = createLoggerForLevel('WARN', LogLevel.WARN, console.warn);
    const error = createLoggerForLevel('ERROR', LogLevel.ERROR, console.error);
    
    return {
      configure,
      debug,
      info,
      warn,
      error
    };
  };
  
  export const logger = createLogger();