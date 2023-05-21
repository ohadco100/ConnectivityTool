export interface Test {
    protocol: string;
    enabled: boolean;
    latencyThresholdInPercentage?: number;
}

export interface URL {
    url: string;
    tests: Test[];
}

export interface Configuration {
    urls: URL[];
    logFile: string;
}

export interface TestResult {
    date: Date;
    protocol?: string;
    success: boolean;
    message?: string;
    ipAddress? : string;
    latency?: number;
    bandwidth?: number;
    latencyDegradationFromPreviousRuns?: boolean;
}

export interface TestResults {
    url: string;
    results: TestResult[];
}

export interface AllResults {
    urls: TestResults[]
}

export interface ProtocolHandler {
    protocol: string;

    checkDomain: (domain: string) => Promise<TestResult>;

    checkDegradationFromPreviousResults: (latencyThresholdInPercentage: number, previousResults: TestResult[] | undefined, testResult: TestResult) => Promise<void>
}

export const enum NetworkProtocols{
    http = 'http',
    https = 'https',
    dns = 'dns'
}