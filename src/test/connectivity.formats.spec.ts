import {CONFIG_FILE_POSTFIX, createConfigFile, randomStr} from "./tests.service";
import {AllResults, Configuration, NetworkProtocols, Test, TestResults} from "../types";
import {runConnectivityTests} from "../runConnectivityTests";
import {promisify} from "util";
import fs from "node:fs";
const readFileAsync = promisify(fs.readFile);
describe("Tests for connectivity tool", () => {

    it("Check Illegal URL format", async () => {

        const randomName: string = 'runs/' + (await randomStr());
        const randomLogFileName = randomName + '_test_results.json';

        const config: Configuration = {logFile: randomLogFileName, urls: []};

        const test: Test = {enabled: true, latencyThresholdInPercentage: 10, protocol: NetworkProtocols.http};

        config.urls.push({url: '????', tests: [test]});

        await createConfigFile(config, randomName);

        await runConnectivityTests(randomName + CONFIG_FILE_POSTFIX);

        const resultsStr = await readFileAsync(randomLogFileName, 'utf8');
        const results: AllResults = JSON.parse(resultsStr);

        const testResults: TestResults = results.urls[0];

        expect(testResults.results[0].protocol).toBeUndefined();
        expect(testResults.results[0].success).toBe(false);
        expect(testResults.results[0].message).toBe(`Invalid domain supplied ????.Please check format`)
    });

});