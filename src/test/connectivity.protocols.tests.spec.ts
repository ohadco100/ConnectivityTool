import {AllResults, Configuration, NetworkProtocols, Test, TestResults} from "../types";
import {promisify} from "util";
import fs from "node:fs";
import {runConnectivityTests} from "../runConnectivityTests";
import {CONFIG_FILE_POSTFIX, createConfigFile, randomStr} from "./tests.service";

const readFileAsync = promisify(fs.readFile);

describe("Tests for connectivity tool", () => {

    it("Check successful http check", async () => {

        const randomName: string = 'runs/'+ (await randomStr());
        const randomLogFileName = randomName+ '_test_results.json';

        const config: Configuration = {logFile: randomLogFileName, urls: []};

        const test: Test = {enabled: true, latencyThresholdInPercentage: 10, protocol: NetworkProtocols.http};

        config.urls.push({url: 'www.ynet.co.il', tests: [test]});

        await createConfigFile(config, randomName);

        await runConnectivityTests(randomName + CONFIG_FILE_POSTFIX);

        const resultsStr = await readFileAsync(randomLogFileName, 'utf8');
        const results: AllResults = JSON.parse(resultsStr);

        const testResults: TestResults = results.urls[0];

        expect(testResults.results[0].protocol).toBe(NetworkProtocols.http);
        expect(testResults.results[0].success).toBe(true);
    });

    it("Check successful https check", async () => {

        const randomName: string = 'runs/'+ (await randomStr());
        const randomLogFileName = randomName+ '_test_results.json';

        const config: Configuration = {logFile: randomLogFileName, urls: []};

        const test: Test = {enabled: true, latencyThresholdInPercentage: 10, protocol: NetworkProtocols.https};

        config.urls.push({url: 'www.ynet.co.il', tests: [test]});

        await createConfigFile(config, randomName);

        await runConnectivityTests(randomName + CONFIG_FILE_POSTFIX);

        const resultsStr = await readFileAsync(randomLogFileName, 'utf8');
        const results: AllResults = JSON.parse(resultsStr);

        const testResults: TestResults = results.urls[0];

        expect(testResults.results[0].protocol).toBe(NetworkProtocols.https);
        expect(testResults.results[0].success).toBe(true);
    });

    it("Check successful dns check", async () => {

        const randomName: string = 'runs/'+ (await randomStr());
        const randomLogFileName = randomName+ '_test_results.json';

        const config: Configuration = {logFile: randomLogFileName, urls: []};

        const test: Test = {enabled: true, latencyThresholdInPercentage: 10, protocol: NetworkProtocols.dns};

        config.urls.push({url: 'www.ynet.co.il', tests: [test]});

        await createConfigFile(config, randomName);

        await runConnectivityTests(randomName + CONFIG_FILE_POSTFIX);

        const resultsStr = await readFileAsync(randomLogFileName, 'utf8');
        const results: AllResults = JSON.parse(resultsStr);

        const testResults: TestResults = results.urls[0];

        expect(testResults.results[0].protocol).toBe(NetworkProtocols.dns);
        expect(testResults.results[0].success).toBe(true);
    });


});

