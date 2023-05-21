import {NetworkProtocols, ProtocolHandler} from "../types";
import {HttpProtocolHandler} from "./httpProtocolHandler";
import {DnsProtocolHandler} from "./dnsProtocolHandler";
import {HttpsProtocolHandler} from "./httpsProtocolHandler";

export class ProtocolHandlerFactory {
  createHandler(protocol: string): ProtocolHandler {
    if (protocol == NetworkProtocols.http) {
      return new HttpProtocolHandler();
    } else if (protocol == NetworkProtocols.https) {
      return new HttpsProtocolHandler();
    } else if (protocol == NetworkProtocols.dns) {
      return new DnsProtocolHandler();
    } else {
      throw new Error("Invalid protocol");
    }
  }
}