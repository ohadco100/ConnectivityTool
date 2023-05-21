import {NetworkProtocols, ProtocolHandler, TestResult} from "../types";
import {lookup} from "node:dns";

export class DnsProtocolHandler implements ProtocolHandler {

    protocol: string = NetworkProtocols.dns;

    checkDomain(domain: string): Promise<TestResult> {
        return new Promise((resolve, reject) => {
            // @ts-ignore
            lookup(domain, (err: NodeJS.ErrnoException, address: string, family: number) => {
                const testResult: TestResult = {date: new Date(), protocol: this.protocol, success: false};
                if (err) {
                    testResult.success = false;
                    testResult.message = `Warning: failed DNS resolving of ${domain} Error: ${err.message}`

                }
                else {
                    console.log(`[${domain}] DNS resolved to: ${address}`);
                    testResult.success = true;
                    testResult.ipAddress = address;
                }
                resolve(testResult);
            });
        });
    }

    async checkDegradationFromPreviousResults(latencyThresholdInPercentage: number, previousResults: TestResult[] | undefined, testResult: TestResult): Promise<void> {
    }

}