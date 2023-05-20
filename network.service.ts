import {lookup} from "node:dns";
import axios from "axios";
import {TestResult, TestResults, Website} from "./types";

function resolveDNS(url: string): Promise<{dnsSuccess:boolean, dnsIpAddress: string}> {
    return new Promise((resolve, reject) => {
        // @ts-ignore
        lookup(url, (err: NodeJS.ErrnoException, address: string, family: number) => {
            if (err) resolve({dnsSuccess:false, dnsIpAddress:err.message});
            else resolve({dnsSuccess:true, dnsIpAddress:address});
        });
    });
}

async function testURL(url: string, protocol: string): Promise<{ success: boolean, latency: number; bandwidth: number }> {
    const response = await axios.get(protocol +'://'+ url, { responseType: 'arraybuffer' });
    const success = response.status == 200;
    const latency = 0;//measureLatency(url);
    const bandwidth = (response.data.length * 8) / latency / 1000; // Kilobits per second
    return { success,latency, bandwidth };
}

import {exec, execSync} from 'child_process';

function measureLatency(url: string): number {
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

export async function testConnectivity(website: Website, previousResults: TestResult[] | undefined): Promise<TestResult[]> {
    const { url, tests } = website;
    const results: TestResult[] = [];

    for (const test of tests) {
        const { protocol, enabled, latencyThreshold = 0, bandwidthThreshold = 0 } = test;

        if (enabled) {
            try {
                let latency = undefined;
                let bandwidth = undefined;
                let latencyDegradationFromPreviousRuns: boolean | undefined = undefined;
                let success = true;
                let ipAddress: string | undefined = undefined;

                if (protocol === 'dns') {
                    const {dnsSuccess, dnsIpAddress} = await resolveDNS(url);
                    success = dnsSuccess;
                    ipAddress = dnsIpAddress;
                    if (dnsSuccess) {
                        console.log(`[${url}] DNS resolved to: ${dnsIpAddress}`);
                    } else {
                        console.error(`ALERT: failed DNS resolving of ${url}`);
                    }
                } else if (protocol === 'http' || protocol === 'https') {
                    latencyDegradationFromPreviousRuns = false;
                    const { success: success, latency: testLatency, bandwidth: testBandwidth } = await testURL(url, protocol);
                    latency = testLatency;
                    bandwidth = testBandwidth;
                    console.log(`[${url}] ${protocol.toUpperCase()} test completed. Latency: ${latency}ms, Bandwidth: ${bandwidth.toFixed(2)}Kbps`);
                }

                if (previousResults) {
                    const previousResultsForProtocol: TestResult[] = previousResults.filter((result) => result.protocol === protocol);
                    for(let i =0 ; i< previousResultsForProtocol.length; i++) {
                        const { latency: previousLatency = 0} = previousResultsForProtocol[i];
                        // @ts-ignore
                        const latencyDiff = Math.abs(latency - previousLatency);

                        if (latencyDiff > latencyThreshold) {
                            console.error(`[${url}] ALERT: ${protocol.toUpperCase()} latency difference exceeded threshold.`);
                            latencyDegradationFromPreviousRuns = true;
                            break;
                        }
                    }
                }

                results.push({ success,ipAddress, protocol, latency, bandwidth, latencyDegradationFromPreviousRuns: latencyDegradationFromPreviousRuns, date: new Date() });
            } catch (error) {
                console.error(`[${url}] ${protocol.toUpperCase()} test failed:`, error);
            }
        }
    }

    return results;
}