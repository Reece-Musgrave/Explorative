
export interface LoginInput {
    username: string;
    password: string;
}

export interface LoginOutput {
    access_token: string;
    token_type: string;
}