import { Message } from "./cometd";
import {Transport} from "./Transport";

interface Envelope {
    messages: Message[];
}

export class WebSocketTransport extends Transport {
    protected createWebSocket(url: string, protocol?: string): WebSocket;
    readonly isWebSocketConnected: boolean;

    protected _notifySuccess(fn: Function, messages: Message[]): void;
    protected _webSocketSend(context: unknown, envelope: Envelope, metaConnect: boolean, isOnOpen?: boolean): void;
    protected _webSocketSentEnvelope(context: unknown, envelope: Envelope, metaConnect: boolean): void;

    protected _onMessage(context: unknown, wsMessage: { data: unknown }): void;

    protected _onClose(context: unknown, event: CloseEvent, forceWebSocketSupported?: boolean): void;
}
