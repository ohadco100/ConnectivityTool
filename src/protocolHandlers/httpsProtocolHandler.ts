import {NetworkProtocols, ProtocolHandler, TestResult} from "../types";
import {HttpProtocolHandler} from "./httpProtocolHandler";

export class HttpsProtocolHandler extends HttpProtocolHandler {

    protocol: string = NetworkProtocols.https;

}