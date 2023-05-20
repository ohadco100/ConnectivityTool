import {ProtocolHandler, TestResult} from "../types";
import {HttpProtocolHandler} from "./httpProtocolHandler";

export class HttpsProtocolHandler extends HttpProtocolHandler {

    protocol: string = 'https';

}