import { Check, ChevronsUpDown } from "lucide-react";
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

import { retrieveEpisode } from "@/api/shows/episodes.ts";
import { retrieveShow } from "@/api/shows/shows.ts";
import Navbar from "@/components/layout/navbar.tsx";
import { AlertTitle, Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAutocomplete } from "@/components/use-autocomplete.tsx";
import { cn } from "@/lib/utils";
import { type Episode } from "@/types/episode.ts";
import { type Show } from "@/types/show.ts";


export function Home() {

    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [showName, setShowName] = useState("");
    const [showData, setShowData] = useState<Show | null>(null);
    const [showSeasons, setShowSeasons] = useState(false);
    const [showEpisodes, setShowEpisodes] = useState(false);
    const [openSeason, setOpenSeason] = useState(false);
    const [showGo, setShowGo] = useState(false);
    const [valueSeason, setValueSeason] = useState<number | null>(null);
    const [openEpisode, setOpenEpisode] = useState(false);
    const [valueEpisode, setValueEpisode] = useState("");
    const [selectionString, setSelectionString] = useState<Episode | null>(null);
    const [errorPopup, setErrorPopup] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [valueURL, setValueURL] = useState("");

    const handleSearchClick = async () => {
      setShowSeasons(true);
      try {
        const data = await retrieveShow(showName);
        setShowData(data);
        setValueURL(data.url);
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
      setSelectionString(data);
    }

    const suggestions = useAutocomplete(showName)
      useEffect(() => {
        setShowSuggestions(suggestions.length > 0);
      }, [suggestions]);

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
      <div className="bg-background bg-gray-50 text-foreground min-h-screen flex flex-col">
        <Navbar />

        <div className="flex flex-1 flex-col md:flex-row">

          <div className="flex flex-1 flex-col justify-start pt-24 px-12 pb-16 border-r border-gray-200">
            <style>{`
              @keyframes fadeUp {
                from { opacity: 0; transform: translateY(20px); }
                to   { opacity: 1; transform: translateY(0); }
              }
              .fade-up-1 { opacity: 0; animation: fadeUp 0.6s ease forwards 0.1s; }
              .fade-up-2 { opacity: 0; animation: fadeUp 0.6s ease forwards 0.25s; }
              .fade-up-3 { opacity: 0; animation: fadeUp 0.6s ease forwards 0.4s; }
            `}</style>
            <p className="fade-up-1 text-sm uppercase tracking-widest text-gray-400 mb-3">
              Reyapp 
            </p>
            <h1 className="fade-up-2 text-5xl font-bold leading-tight mb-5">
              Engage with any episode,<br />spoiler free.
            </h1>
            <p className="fade-up-3 text-gray-500 text-lg leading-relaxed max-w-sm">
              Search for a show, pick your episode, and start now.
            </p>
          </div>
          <div className="flex flex-1 flex-col items-center justify-start pt-24 pb-16 px-10 gap-y-4">

          <div className="relative flex w-full max-w-sm items-center gap-2">
            <Input
              placeholder="What are you looking for?"
              value={showName}
              onChange={(e) => setShowName(e.target.value)}
              className="bg-white border-gray-200"
            />
            {showSuggestions && (
              <ul className="absolute top-full left-0 right-0 border border-gray-200 mt-1 rounded-lg bg-white shadow-sm max-h-40 overflow-y-auto z-50">
                {suggestions.map((show) => (
                  <li
                    key={show.id}
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-700"
                    onClick={() => { setShowName(show.name); setShowSuggestions(false); }}
                  >
                    {show.name}
                  </li>
                ))}
              </ul>
            )}
            <Button
              type="button"
              onClick={handleSearchClick}
              className="bg-gray-900 text-white hover:bg-gray-700 border-none font-mono font-semibold text-xs"
            >
              Search
            </Button>
          </div>

          {errorPopup && (
            <Alert variant="destructive" className="max-w-sm">
              <AlertTitle>Show not found — check the spelling?</AlertTitle>
            </Alert>
          )}

          <hr className="w-full max-w-sm border-gray-200" />

          {showSeasons && (
            <div className="animate-slideIn flex items-center gap-4 w-full max-w-sm bg-white border border-gray-200 rounded-xl p-4">
              {showData?.url && (
                <img src={showData.url} className="w-12 h-16 object-cover rounded-md flex-shrink-0" />
              )}
              <div>
                <p className="font-mono text-[9px] tracking-[3px] text-gray-400 mb-1">SHOW FOUND</p>
                <p className="font-semibold text-gray-900 text-base m-0">{showName}</p>
                {showData && (
                  <p className="text-sm text-gray-400 m-0">
                    {showData.seasons} season{showData.seasons !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>
          )}

          {showSeasons && (
            <div className="animate-slideIn flex flex-col gap-3 w-full max-w-sm">
              <p className="font-mono text-[10px] tracking-[3px] text-gray-400">
                SELECT SEASON &amp; EPISODE
              </p>

              <div className="flex gap-2">
                <Popover open={openSeason} onOpenChange={setOpenSeason}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openSeason}
                      className="w-[152px] justify-between bg-white border-gray-200 text-gray-600"
                    >
                      {valueSeason ? seasonOptions.find((s) => s.value === valueSeason)?.label : "Season..."}
                      <ChevronsUpDown className="opacity-40" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[152px] p-0">
                    <Command>
                      <CommandInput placeholder="Search..." className="h-9" />
                      <CommandList>
                        <CommandEmpty>No season found.</CommandEmpty>
                        <CommandGroup>
                          {seasonOptions.map((season) => (
                            <CommandItem
                              key={season.value}
                              value={season.value.toString()}
                              onSelect={(v) => {
                                setValueSeason(Number(v));
                                setShowEpisodes(true);
                                setValueEpisode("");
                                setOpenSeason(false);
                              }}
                            >
                              {season.label}
                              <Check className={cn("ml-auto", valueSeason === season.value ? "opacity-100" : "opacity-0")} />
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
                        className="flex-1 justify-between bg-white border-gray-900 text-gray-900"
                      >
                        {valueEpisode ? `Episode ${valueEpisode}` : "Episode..."}
                        <ChevronsUpDown className="opacity-40" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[180px] p-0">
                      <Command>
                        <CommandInput placeholder="Search..." className="h-9" />
                        <CommandList>
                          <CommandEmpty>No episode found.</CommandEmpty>
                          <CommandGroup>
                            {episodeOptions.map((episode) => (
                              <CommandItem
                                key={episode.value}
                                value={episode.value.toString()}
                                onSelect={(v) => {
                                  setValueEpisode(v);
                                  setOpenEpisode(false);
                                  handleSelection(v);
                                  setShowGo(true);
                                }}
                              >
                                {episode.label}
                                <Check className={cn("ml-auto", valueEpisode === episode.value.toString() ? "opacity-100" : "opacity-0")} />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              </div>

              {showGo && (
                <Button
                  className="animate-slideIn w-full bg-gray-900 hover:bg-gray-700 text-white border-none font-mono font-semibold text-xs tracking-widest py-6 rounded-lg"
                  onClick={() => navigate("/episode", { state: selectionString })}
                >
                  LET'S GO →
                </Button>
              )}
            </div>
            )}
          </div>
        </div>
      </div>
    );
  }

export default Home;