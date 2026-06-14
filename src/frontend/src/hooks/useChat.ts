import { useEffect, useRef, useState, useCallback } from "react";
import { type ChatMessage, type UseChatOptions, type UseChatReturn } from "@/types/chat";


export function useChat({ showName, seasonNumber, episodeNumber, token, username, enabled }: UseChatOptions): UseChatReturn {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [viewerCount, setViewerCount] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [connected, setConnected] = useState(false);

    const wsRef = useRef<WebSocket | null>(null);

    const sendMessage = useCallback((text: string, replyToId?: number | null) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: "message",
                message: text,
                ...(replyToId ? { reply_to_id: replyToId } : {}),
            }));
        }
    }, []);

    const sendReaction = useCallback((messageId: number, emoji: string) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: "react", message_id: messageId, emoji }));
        }
    }, []);

    useEffect(() => {
        if (!enabled) return;

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
                    setMessages(prev => [...prev, { ...data, isHistory: true }]);
                    break;

                case "message":
                    setMessages(prev => [...prev, data]);
                    break;

                case "reaction_update":
                    setMessages(prev => prev.map(msg => {
                        if (msg.id !== data.message_id) return msg;
                        const updated: ChatMessage = { ...msg, reactions: data.reactions };
                        if (data.reactor === username) {
                            const current = msg.user_reactions ?? [];
                            updated.user_reactions = data.added
                                ? [...current, data.emoji]
                                : current.filter((e: string) => e !== data.emoji);
                        }
                        return updated;
                    }));
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
    }, [enabled, showName, seasonNumber, episodeNumber, token, username]);

    return { messages, viewerCount, sendMessage, sendReaction, error, connected };
}