import { apiClient } from '@/lib/apiClient';
import { type AutoCompleteResponse } from '@/types/show';

export async function autocomplete(inputString: string): Promise<AutoCompleteResponse[]> {
    return apiClient.get<AutoCompleteResponse[]>(`/database/n-shows/${encodeURIComponent(inputString)}`);
}