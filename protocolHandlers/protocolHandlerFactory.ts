import {ProtocolHandler} from "../types";
import {HttpProtocolHandler} from "./httpProtocolHandler";
import {DnsProtocolHandler} from "./dnsProtocolHandler";
import {HttpsProtocolHandler} from "./httpsProtocolHandler";

export class ProtocolHandlerFactory {
  createHandler(protocol: string): ProtocolHandler {
    if (protocol === "http") {
      return new HttpProtocolHandler();
    } else if (protocol === "https") {
      return new HttpsProtocolHandler();
    } else if (protocol === "dns") {
      return new DnsProtocolHandler();
    } else {
      throw new Error("Invalid protocol");
    }
  }
}