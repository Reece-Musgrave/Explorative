import Navbar from "../components/layout/navbar.tsx"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AlertTitle } from "@/components/ui/alert"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { retrieveShow } from "../api/shows/shows.ts"
import { retrieveEpisode } from "../api/shows/episodes.ts"
import { type RetrieveShowOutput, type RetrieveEpisodeOutput } from "../api/shows/types.ts";
import { useState, useEffect } from 'react';
import { Alert } from "@/components/ui/alert.tsx"
import { useAutocomplete } from "../components/use-autocomplete.tsx"

export function Home() {

    const [error, setError] = useState<string | null>(null);
    const [showName, setShowName] = useState("");
    const [showData, setShowData] = useState<RetrieveShowOutput | null>(null);
    const [showSeasons, setShowSeasons] = useState(false);
    const [showEpisodes, setShowEpisodes] = useState(false);
    const [openSeason, setOpenSeason] = useState(false);
    const [showGo, setShowGo] = useState(false);
    const [valueSeason, setValueSeason] = useState<number | null>(null);
    const [openEpisode, setOpenEpisode] = useState(false);
    const [valueEpisode, setValueEpisode] = useState("");
    const [selectionString, setSelectionString] = useState<RetrieveEpisodeOutput | null>(null);
    const [errorPopup, setErrorPopup] = useState(false)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [valueURL, setValueURL] = useState("");

    const handleSearchClick = async () => {
      setShowSeasons(true);
      try {
        const data = await retrieveShow(showName);
        setShowData(data);
        setValueURL(data.url)
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Something went wrong");
        setShowSeasons(false);
        setErrorPopup(true);
      }
      setValueSeason(null);
      setValueEpisode("");
      setShowEpisodes(false);
    };

    const handleSelection = async (episodeNumber: string) => {
      const data = await retrieveEpisode(showName, Number(valueSeason), Number(episodeNumber), valueURL);
      setSelectionString(data)
    }

    const suggestions = useAutocomplete(showName)
      useEffect(() => {
        setShowSuggestions(suggestions.length > 0)
      }, [suggestions])

    const episodeOptions =
      showData && valueSeason
        ? (() => {
            const season = showData.episodes.find(
              ([, seasonNumber]) => seasonNumber === valueSeason
            );
            if (!season) return [];
            const numberOfEpisodes = season[2];
            return Array.from({ length: numberOfEpisodes }, (_, i) => ({
              value: i + 1,
              label: `Episode ${i + 1}`,
            }));
          })()
        : [];

    const seasonOptions =
        showData?.seasons
          ? Array.from({ length: showData.seasons }, (_, i) => ({
              value: i + 1,
              label: `Season ${i + 1}`,
            }))
    : [];

    useEffect(() => {
      if (errorPopup) {
        const timer = setTimeout(() => {
          setErrorPopup(false);
        }, 3000); 
  
        return () => clearTimeout(timer);
      }
    }, [errorPopup]);

    return (
      <div className="bg-background bg-gray-50 text-foreground min-h-screen" >
          <Navbar />
          <div className="flex flex-col md:min-h-30 items-center justify-center gap-y-3">
          <div className="relative flex w-full max-w-sm items-center justify-center gap-2 bg-white">
            <Input 
              placeholder="What are you looking for?" 
              value={showName} 
              onChange={(e) => setShowName(e.target.value)} 
            />

            {showSuggestions && (
              <ul className="absolute top-full left-0 right-0 border mt-1 rounded bg-white shadow-md max-h-40 overflow-y-auto z-50">
                {suggestions.map((show) => (
                  <li 
                    key={show.id} 
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setShowName(show.name);
                      setShowSuggestions(false);}} 
                  >
                    {show.name}
                  </li>
                ))}
              </ul>
            )}

            <Button type="button" variant="outline" onClick={handleSearchClick}>
              Search
            </Button>
          </div>
          {errorPopup && (
            <Alert variant="destructive" className="text-center max-w-md"> 
              <AlertTitle>Sorry! Could not find that show. Did you type it correctly?</AlertTitle>
            </Alert>
          )}
          {showSeasons && (
            <div className="items-center justify-center">
              <img src={showData?.url}/>
            </div>
          )}
          {showSeasons && (
            <div className="flex w-full max-w-sm items-center justify-center gap-2">     
              <Popover open={openSeason} onOpenChange={setOpenSeason}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openSeason}
                    className="w-[200px] justify-between"
                  >
                    {valueSeason
                      ? seasonOptions.find((s) => s.value === valueSeason)?.label
                      : "Select Season..."}
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search season..." className="h-9" />
                    <CommandList>
                      <CommandEmpty>No Season found.</CommandEmpty>
                      <CommandGroup>
                        {seasonOptions.map((season) => (
                          <CommandItem
                            key={season.value}
                            value={season.value.toString()} 
                            onSelect={(currentValue) => {
                              setValueSeason(Number(currentValue));
                              setShowEpisodes(true);
                              setValueEpisode("");
                              setOpenSeason(false);
                            }}
                          >
                            {season.label}
                            <Check
                              className={cn(
                                "ml-auto",
                                valueSeason === season.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {showEpisodes && (
                <Popover open={openEpisode} onOpenChange={setOpenEpisode}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openEpisode}
                      className="w-[200px] justify-between"
                    >
                      {valueEpisode
                        ? `Episode ${valueEpisode}`
                        : "Select Episode..."}
                      <ChevronsUpDown className="opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput placeholder="Search episode..." className="h-9" />
                      <CommandList>
                        <CommandEmpty>No Episode found.</CommandEmpty>
                        <CommandGroup>
                        {episodeOptions.map((episode) => (
                          <CommandItem
                            key={episode.value}
                            value={episode.value.toString()}
                            onSelect={(currentValue) => {
                              setValueEpisode(currentValue);
                              setOpenEpisode(false);
                              handleSelection(currentValue);
                              setShowGo(true);
                            }}
                          >
                            {episode.label}
                            <Check
                              className={cn(
                                "ml-auto",
                                valueEpisode === episode.value.toString()
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                )}
                {showGo && (
                  <Button variant="outline" onClick={() => {
                    console.log(selectionString);
                  }}>Let's Go!</Button>
                )}
            </div>
          )}
        </div>
    </div>
    );
  }

export default Home
