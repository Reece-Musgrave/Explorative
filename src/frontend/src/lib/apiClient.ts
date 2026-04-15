
const BASE_URL = '/api/v1';

async function get<T>(path: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`);
    if (!response.ok) throw new Error(`GET ${path} failed: ${response.status}`);
    return response.json();
}

async function put<T = void>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    if (!response.ok) throw new Error(`PUT ${path} failed: ${response.status}`);
    if (response.status === 204) return undefined as T;
    return response.json();
}

export const apiClient = { get, put };