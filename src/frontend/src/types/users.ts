export interface LoginRequest {
    username: string;
    password: string;
};

export interface LoginResponse {
    accessToken: string;
    tokenType: string;
};

export interface RegisterRequest {
    username: string;
    email: string;
    fullName: string;
    password: string;
};