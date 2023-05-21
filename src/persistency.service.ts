import {AllResults, Configuration, TestResult, TestResults} from "./types";
import {URL} from "./types";
import {promisify} from "util";
import fs from "node:fs";

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

export class PersistencyService {

    existingResults: AllResults = {urls:[]};
    logFile: string = '';

    async readConfiguration(configFilePath: string): Promise<URL[]> {

        const configData = await readFileAsync(configFilePath, 'utf8');
        const configuration: Configuration = JSON.parse(configData);
        const {urls, logFile} = configuration;
        this.logFile = logFile;

        try {
            const previousResultsData = await readFileAsync(logFile, 'utf8');
            this.existingResults = JSON.parse(previousResultsData);
        } catch (error) {
            console.warn('Failed to read previous results file:', error);
        }
        return urls;
    }

    async getPreviousTestsResults(url:URL): Promise<TestResult[]>{
        const previousTestResultsForURL: TestResults[] = this.existingResults.urls.filter((testResults) => testResults.url == url.url);
        if (previousTestResultsForURL[0]) {
            return previousTestResultsForURL[0].results;
        } else {
            return [];
        }
    }

    async storeNewResults(newResults: TestResults) {
        const previousTestResultsForURL: TestResults[] = this.existingResults.urls.filter((testResults) => testResults.url == newResults.url);
        if (previousTestResultsForURL[0]) {
            const indexOfURL: number = this.existingResults.urls.indexOf(previousTestResultsForURL[0]);
            this.existingResults.urls.splice(indexOfURL, 1);
        }
        this.existingResults.urls.push(newResults);
    }

    async flushResults(): Promise<void> {

        const allResultsData = JSON.stringify(this.existingResults, null, 2);

        await writeFileAsync(this.logFile, allResultsData);
    }
}