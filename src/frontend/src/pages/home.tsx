import Navbar from "../components/layout/navbar.tsx"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import * as React from "react"
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
import { retrieveShow } from "../api/shows/retrieveShow.ts"
import { type RetrieveShowOutput } from "../api/shows/types.ts";



const frameworks = [
  {
    value: "next.js",
    label: "Next.js",
  },
]
export function Home() {

    const [error, setError] = React.useState<string | null>(null);
    const [showName, setShowName] = React.useState("");
    const [showData, setShowData] = React.useState<RetrieveShowOutput | null>(null);
    const [showSeasons, setShowSeasons] = React.useState(false);
    const [showEpisodes, setShowEpisodes] = React.useState(false);
    const [openSeason, setOpenSeason] = React.useState(false);
    const [valueSeason, setValueSeason] = React.useState<number | null>(null);
    const [openEpisode, setOpenEpisode] = React.useState(false);
    const [valueEpisode, setValueEpisode] = React.useState("");

    const handleSearchClick = async () => {
      setShowSeasons(true);
      try {
        const data = await retrieveShow(showName);
        setShowData(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Something went wrong");
      }
      setValueSeason(null);
      setValueEpisode("");
      setShowEpisodes(false);
    };

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

    return (
    <div className="bg-background text-foreground min-h-screen" >
        <Navbar />
        <div className="flex flex-col md:min-h-30 items-center justify-center gap-y-3">
          <div className="flex w-full max-w-sm items-center justify-center gap-2">
            <Input 
              placeholder="What are you looking for?" 
              value={showName} 
              onChange={(e) => setShowName(e.target.value)} 
            />
            <Button type="button" variant="outline" onClick={handleSearchClick}>
              Search
            </Button>
          </div>
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
            </div>
          )}
        </div>
    </div>
    );
  }

export default Home
