import color, {echo} from "colorts";
import { IExecutionContextConfiguration } from "./model/IExecutionContextConfiguration";
import fs from "fs-extra";
import path from "path";

export enum LogStyle {
    Default,
    Start,
    Warning,
    Error,
    Success
}

export interface ILogging {
    log: LogWithStyle
    setLogging(log: boolean): void
}

export class LogWithStyle {
    public logToConsole: boolean;

    public constructor (logToConsole: boolean = false) {
        this.logToConsole = logToConsole;
    }

    public writeStart(message: string) {
        this.write(message, LogStyle.Start);
    }

    public writeWarning(message: string) {
        this.write(message, LogStyle.Warning);
    }

    public writeError(message: string) {
        this.write(message, LogStyle.Error);
    }

    public writeSuccess(message: string) {
        this.write(message, LogStyle.Success);
    }

    public write(message: string, style: LogStyle = LogStyle.Default) {
        if (this.logToConsole) {
            switch (style) {
                case LogStyle.Start:
                    echo(color(message).white.bold);        
                    break;
                case LogStyle.Error:
                    echo(color(message).red.bold);
                    break;
                case LogStyle.Success:
                    echo(color(message).green.bold);        
                    break;
                case LogStyle.Warning:
                    echo(color(message).yellow.bold);        
                    break;
                default:
                    echo(color(message).gray);        
                    break;
            }            
        }
    }
}

export class DefaultExecutionContextConfiguration implements IExecutionContextConfiguration {
    public key: string;
    public outputFolderPath: string;
    public configFolderPath: string;
    public ensureUniqueOutputFolder: boolean;

    public constructor(key: string) {
        this.key = key;
        this.configFolderPath = './config';
        this.outputFolderPath = './output';
        this.ensureUniqueOutputFolder = true;
    }
}

export class ExecutionContext implements ILogging {
    public configuration: IExecutionContextConfiguration;
    public log: LogWithStyle;
    public resolvedConfigPath: string;
    public resolvedOutputPath: string;

    
    setLogging(log: boolean): void {
        this.log.logToConsole = log;
    }
    
    public constructor(configuration?:IExecutionContextConfiguration, key? :string) {
        this.log = new LogWithStyle(false);
        if (!configuration && !key) {
            this.log.writeError('You need to specify a configuration or a key');
            throw new Error('Neither a configuration or a key was specified');
        }
        if (!configuration && key) {
            configuration = new DefaultExecutionContextConfiguration(key);
        }
        this.configuration = configuration!;
        this.resolvedConfigPath = path.resolve(this.configuration.configFolderPath);
        this.resolvedOutputPath = this.configuration.ensureUniqueOutputFolder
            ? path.resolve(path.join(this.configuration.outputFolderPath, new Date().toISOString().split(':').join("-").replace('.', '-')))
            : path.resolve(this.configuration.outputFolderPath);
        
        this.log.writeError(`Ensuring config path: ${this.resolvedConfigPath}`)
        fs.ensureDirSync(this.resolvedConfigPath);
        this.log.writeError(`Ensuring output path: ${this.resolvedOutputPath}`)
        fs.ensureDirSync(this.resolvedOutputPath);
    }

    public getConfigurationFilePath(fileName : string) : string {
        return path.join(this.resolvedConfigPath, fileName);
    }
    
    public getOutputFilePath(fileName : string) : string {
        return path.join(this.resolvedOutputPath, fileName);
    }
}