import {Transport} from "./Transport";

export class WebSocketTransport extends Transport {
    protected createWebSocket(url: string, protocol: string): WebSocket;
}
