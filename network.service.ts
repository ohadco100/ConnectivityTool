import {ProtocolHandler, TestResult, URL} from "./types";
import {execSync} from 'child_process';
import {isValidDomain} from "./validation.service";
import {ProtocolHandlerFactory} from "./protocolHandlers/protocolHandlerFactory";

export async function testConnectivity(website: URL, previousResults: TestResult[] | undefined): Promise<TestResult[]> {
    const { url, tests } = website;
    const results: TestResult[] = [];

    if (!isValidDomain(url)){
        const testResult : TestResult = {date: new Date(),success: false};
        testResult.message = `Invalid domain supplied ${url}.Please check format`
        console.error(testResult.message);
        results.push(testResult);
        return results;
    }

    for (const test of tests) {
        const { protocol, enabled, latencyThresholdInPercentage = 0} = test;

        if (enabled) {
            try {
                let testResult : TestResult = {date: new Date(), protocol: protocol, success: true};

                if (!isValidDomain(url)){
                    testResult.success = false;
                    testResult.message = `Invalid domain supplied ${url}.Please check format`
                    console.error(testResult.message);
                    continue;
                }

                const protocolHandlerFactory :  ProtocolHandlerFactory = new ProtocolHandlerFactory();
                try {
                    const protocolHandler: ProtocolHandler = protocolHandlerFactory.createHandler(protocol);
                    testResult = await protocolHandler.checkDomain(url);
                    await protocolHandler.checkDegradationFromPreviousResults(latencyThresholdInPercentage,previousResults, testResult);
                } catch (err: any){
                    if (err.message === 'Invalid protocol') {
                        testResult.success = false;
                        testResult.message = `Unsupported protocol ${protocol}`
                        console.error(testResult.message);
                    } else {
                        testResult.success = false;
                        testResult.message = err.message;
                        console.error(`Error for protocol ${protocol}. Error: ${testResult.message}`);
                    }
                }

                results.push(testResult);
            } catch (error) {
                console.error(`[${url}] ${protocol.toUpperCase()} test failed:`, error);
            }
        }
    }

    return results;
}

export function measureLatency(url: string): number {
    const command = process.platform === 'win32' ? `ping ${url}` : `ping -c 5 ${url}`;
    let latency: number = -1;
    const output = execSync(command).toString();

    // Extract the average round-trip time (RTT) from the output
    const regex = /time=(\d+(?:\.\d+)?)\s*ms/;
    const match = output.match(regex);
    if (match) {
        const latency: number = parseFloat(match[1]);
        console.log(`Website latency: ${latency} ms`);
        return latency
    } else {
        console.error('Unable to parse latency from the ping output.');
    }
    return latency;
}
