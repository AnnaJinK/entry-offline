// configuration for entire program setting

declare interface ExternalConfigurations {
    language?: string,
    baseUrl: string,
    baseResource: string,
    versionCheckApi: string,
    moduleCheckApi: string,
}

declare interface InternalConfigurations {
    appName: string,
    hardwareVersion: string,
    roomIds: string[],
    hostURI: string,
    hostProtocol: string,
}

declare type Configurations =  ExternalConfigurations & InternalConfigurations;

// CommandLine Options

declare type CommandLineFlags = {
    debug?: boolean;
    version?: boolean;
}

declare type CommandLinePairs = {
    file?: any;
    host?: string;
    protocol?: string;
    config?: string;
}

declare type CommandLineOptions = CommandLineFlags & CommandLinePairs;
