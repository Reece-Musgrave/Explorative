import { type RegisterRequest } from "@/types/users"


export async function register(input: RegisterRequest): Promise<number> {
    const headers: Headers = new Headers();
    headers.set('Content-Type', 'application/json');
    const body = JSON.stringify({
        username: input.username,
        email: input.email,
        full_name: input.fullName,
        password: input.password,
    });
    const request: RequestInfo = new Request(`/api/v1/users/register`, {
        method: 'POST',
        headers: headers,
        body: body
    });
    const response = await fetch(request);
    if (response.ok){
        return response.status;
    }
    else{
        throw new Error("Unable to add user, does the user already exist?");
    }
}