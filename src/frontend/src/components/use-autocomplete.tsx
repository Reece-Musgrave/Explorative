import { useState, useEffect } from "react"
import { autocomplete } from "../api/shows/autocomplete"
import type { AutoCompleteOutput } from "../api/shows/types"

export function useAutocomplete(query: string, delay = 200): AutoCompleteOutput[] {
    const [results, setResults] = useState<AutoCompleteOutput[]>([])

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
