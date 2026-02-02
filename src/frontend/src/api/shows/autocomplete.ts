import { API_BASE_URL } from "../client";
import { type AutoCompleteOutput } from "./types";


export async function autocomplete(inputString: string): Promise<AutoCompleteOutput[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/database/retrieve-n-shows/${encodeURIComponent(inputString)}`)
  
    if (!response.ok) {
      throw new Error("Failed to fetch autocomplete")
    }
  
    const shows: AutoCompleteOutput[] = await response.json()
    return shows
  }
