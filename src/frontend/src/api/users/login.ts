import {type LoginRequest, type LoginResponse} from "@/types/users" 


export async function loginUser(login: LoginRequest): Promise<LoginResponse> {
    const headers: Headers = new Headers()
    headers.set('Content-Type', 'application/x-www-form-urlencoded')
    const body = new URLSearchParams({
        username: login.username,
        password: login.password,
    });
    const request: RequestInfo = new Request(`/api/v1/users/login`, {
        method: 'POST',
        headers: headers,
        body: body,
        credentials: 'include',
    });
    const response = await fetch(request);
    if (response.ok){
        const { access_token, token_type }= await response.json();
        return {
            accessToken: access_token,
            tokenType: token_type
        };
    }
    else{
        throw new Error("Unable to retrieve user, are you sure the details were correct?");
    }
}