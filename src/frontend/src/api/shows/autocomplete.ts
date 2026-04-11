import { type AutoCompleteResponse } from "@/types/show"


export async function autocomplete(inputString: string): Promise<AutoCompleteResponse[]> {
    const response = await fetch(`/api/v1/database/retrieve-n-shows/${encodeURIComponent(inputString)}`);
  
    if (!response.ok) {
      throw new Error("Failed to fetch autocomplete")
    };
  
    const shows: AutoCompleteResponse[] = await response.json();
    return shows;
  }
