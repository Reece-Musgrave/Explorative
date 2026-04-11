import { useState, useEffect } from "react"
import { autocomplete } from "../api/shows/autocomplete"
import { type AutoCompleteResponse } from "@/types/show"

export function useAutocomplete(query: string, delay = 200): AutoCompleteResponse[] {
    const [results, setResults] = useState<AutoCompleteResponse[]>([])

    useEffect(() => {
        if (!query) {
        setResults([])
        return
        }

    const handler = setTimeout(() => {
      console.log("Calling autocomplete API for:", query)

      autocomplete(query)
        .then((res) => {
          console.log("Results received:", res)
          setResults(res)
        })
        .catch((err) => {
          console.error("Autocomplete API error:", err)
        })
    }, delay)

        return () => clearTimeout(handler)
    }, [query, delay])

    return results
}
