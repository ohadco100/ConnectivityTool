export interface Test {
    protocol: string;
    enabled: boolean;
    latencyThreshold?: number;
    bandwidthThreshold?: number;
}

export interface Website {
    url: string;
    tests: Test[];
}

export interface Configuration {
    websites: Website[];
    logFile: string;
}

export interface TestResult {
    date: Date;
    protocol: string;
    success: boolean;
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