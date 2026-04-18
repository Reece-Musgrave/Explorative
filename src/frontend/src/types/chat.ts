export interface ChatMessage {
    id: number;
    username: string;
    message: string;
    created_at: string;
    isHistory?: boolean;
}

export interface UseChatOptions {
    showName: string;
    seasonNumber: number;
    episodeNumber: number;
    token?: string | null; 
    enabled: boolean;       
}

export interface UseChatReturn {
    messages: ChatMessage[];
    viewerCount: number;
    sendMessage: (text: string) => void;
    error: string | null;
    connected: boolean;
}