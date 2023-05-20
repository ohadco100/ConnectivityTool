import fs from 'node:fs';
import { promisify } from 'util';
import {AllResults, Configuration, TestResult, TestResults, Website} from "./types";
import {testConnectivity} from "./network.service";

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

async function runConnectivityTests(configFilePath: string) : Promise<void> {
    try {
        const configData = await readFileAsync(configFilePath, 'utf8');
        const configuration: Configuration = JSON.parse(configData);
        const { websites, logFile } = configuration;

        let existingResults: AllResults = {urls: []};

        try {
            const previousResultsData = await readFileAsync(logFile, 'utf8');
            existingResults = JSON.parse(previousResultsData);
        } catch (error) {
            console.warn('Failed to read previous results file:', error);
        }



        for (const website of websites) {
            const newResults: TestResults = {url: website.url, results:[]};
            const previousTestResultsForURL: TestResults[] = existingResults.urls.filter((testResults) => testResults.url == website.url);
            let previousResultsForURL: TestResult[] = [];
            if (previousTestResultsForURL[0]) {
                previousResultsForURL = previousTestResultsForURL[0].results;
            }
            const results = await testConnectivity(website, previousResultsForURL);
            newResults.results = [...previousResultsForURL, ...results];
            //replacing the URL results with new one
            if (previousTestResultsForURL[0]) {
                const indexOfURL: number = existingResults.urls.indexOf(previousTestResultsForURL[0]);
                existingResults.urls.splice(indexOfURL,1);
            }
            existingResults.urls.push(newResults);
        }

        const allResultsData = JSON.stringify(existingResults, null, 2);
        // if (Object.keys(existingResults).length) {
        //     await writeFileAsync(logFile, ',');
        // }
        await writeFileAsync(logFile, allResultsData);
        console.log('All tests completed successfully.');

    } catch (error) {
        console.error('An error occurred:', error);
    }
}

const configFilePath = 'config.json';
runConnectivityTests(configFilePath);
