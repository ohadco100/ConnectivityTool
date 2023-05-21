import {PersistencyService} from "./persistency.service";
import {TestResult, TestResults, URL} from "./types";
import {testConnectivity} from "./network.service";

export async function runConnectivityTests(configFilePath: string) : Promise<void> {
    try {
        const persistencyService: PersistencyService = new PersistencyService();
        const urls: URL[] = await persistencyService.readConfiguration(configFilePath);

        for (const url of urls) {

            const newResults: TestResults = {url: url.url, results:[]};

            const previousTestResultsForURL: TestResult[] = await persistencyService.getPreviousTestsResults(url);

            const results = await testConnectivity(url, previousTestResultsForURL);

            newResults.results = [...previousTestResultsForURL, ...results];

            await persistencyService.storeNewResults(newResults);
        }

        await persistencyService.flushResults();

        console.log('All tests completed successfully.');

    } catch (error) {
        console.error('An error occurred:', error);
    }
}