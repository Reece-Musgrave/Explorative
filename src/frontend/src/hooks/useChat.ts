import { useEffect, useRef, useState, useCallback } from "react";
import { type ChatMessage, type UseChatOptions, type UseChatReturn } from "@/types/chat";


export function useChat({showName, seasonNumber, episodeNumber, token,enabled, }: UseChatOptions): UseChatReturn {
    const [messages, setMessages]     = useState<ChatMessage[]>([]);
    const [viewerCount, setViewerCount] = useState(0);
    const [error, setError]           = useState<string | null>(null);
    const [connected, setConnected]   = useState(false);

    const wsRef = useRef<WebSocket | null>(null);

    const sendMessage = useCallback((text: string) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: "message", message: text }));
        }
    }, []);

    useEffect(() => {
        if (!enabled) return;

        const params = new URLSearchParams();
        if (token) params.set("token", token);

        const url =
            `/ws/chat/${encodeURIComponent(showName)}` +
            `/${seasonNumber}/${episodeNumber}` +
            (token ? `?token=${token}` : "");

        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
            setConnected(true);
            setError(null);
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            switch (data.type) {
                case "history":
                    setMessages(prev => [
                        ...prev,
                        { ...data, isHistory: true },
                    ]);
                    break;

                case "message":
                    setMessages(prev => [...prev, data]);
                    break;

                case "viewer_count":
                    setViewerCount(data.count);
                    break;

                case "error":
                    setError(data.message);
                    setTimeout(() => setError(null), 4000);
                    break;
            }
        };

        ws.onclose = () => {
            setConnected(false);
        };

        ws.onerror = () => {
            setError("Connection lost. Refresh to reconnect.");
            setConnected(false);
        };

        return () => {
            ws.close();
            wsRef.current = null;
            setMessages([]);
            setConnected(false);
        };
    }, [enabled, showName, seasonNumber, episodeNumber, token]);

    return { messages, viewerCount, sendMessage, error, connected };
}