import {ProtocolHandler, TestResult} from "../types";
import axios from "axios";
import {measureLatency} from "../network.service";

export class HttpProtocolHandler implements ProtocolHandler {

    protocol: string = 'http';
    async checkDomain(domain: string): Promise<TestResult> {
        const testResult: TestResult = {date: new Date(), protocol: "", success: false, latencyDegradationFromPreviousRuns: false};
        const response = await axios.get(this.protocol +'://'+ domain, { responseType: 'arraybuffer' });

        //treating status code 300 till 400 as "good responses".
        testResult.success = response.status >= 200 && response.status < 400;
        testResult.latency = measureLatency(domain);
        testResult.bandwidth = (response.data.length * 8) / testResult.latency / 1000; // Kilobits per second
        if (testResult.success) {
            console.log(`[${domain}] ${this.protocol.toUpperCase()} test completed. Latency: ${testResult.latency}ms, Bandwidth: ${testResult.bandwidth.toFixed(2)}Kbps`);
        } else {
            testResult.message =`[${domain}] ${this.protocol.toUpperCase()} test failed. Status Code: ${response.status} Latency: ${testResult.latency}ms, Bandwidth: ${testResult.bandwidth.toFixed(2)}Kbps`;
            console.warn(testResult.message);
        }
        return testResult;
    }

    async checkDegradationFromPreviousResults(latencyThresholdInPercentage: number, previousResults: TestResult[] | undefined, testResult: TestResult): Promise<void>{
        if (previousResults) {
            const previousResultsForProtocol: TestResult[] = previousResults.filter((result) => result.protocol === this.protocol);
            for(let i =0 ; i< previousResultsForProtocol.length; i++) {
                const { latency: previousLatency = 0} = previousResultsForProtocol[i];
                // @ts-ignore
                const latencyDiff = Math.abs(latency - previousLatency);

                if ((latencyDiff/previousLatency)*100 > latencyThresholdInPercentage) {
                    testResult.message = `[Warning: ${this.protocol.toUpperCase()} latency difference exceeded threshold.`
                    console.warn(testResult.message);
                    testResult.latencyDegradationFromPreviousRuns = true;
                    break;
                }
            }
        }
    }

}