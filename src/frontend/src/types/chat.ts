export interface ChatMessage {
    id: number;
    username: string;
    message: string;
    created_at: string;
    isHistory?: boolean;
    reactions?: Record<string, number>;
    user_reactions?: string[];
    reply_to_id?: number | null;
    reply_to_username?: string | null;
    reply_to_message?: string | null;
}

export interface ReplyTo {
    id: number;
    username: string;
    message: string;
}

export interface UseChatOptions {
    showName: string;
    seasonNumber: number;
    episodeNumber: number;
    token?: string | null;
    username?: string | null;
    enabled: boolean;
}

export interface UseChatReturn {
    messages: ChatMessage[];
    viewerCount: number;
    sendMessage: (text: string, replyToId?: number | null) => void;
    sendReaction: (messageId: number, emoji: string) => void;
    error: string | null;
    connected: boolean;
}
