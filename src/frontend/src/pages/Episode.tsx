import Navbar from "../components/layout/navbar.tsx"
import { useState, useEffect } from "react"
import { retrieveRatings } from "../api/shows/ratings.ts";
import { useLocation, useNavigate} from "react-router-dom";
import { type RetrieveEpisodeOutput, type IMDBRating, type RTRating } from "../api/shows/types.ts";

export function Episode() {

    const navigate = useNavigate();
    const [sentimentOpen, setSentimentOpen] = useState(true)
    const [communityOpen, setCommunityOpen] = useState(false)
    const [chatOpen, setChatOpen] = useState(false)
    const location = useLocation();
    const episodeData: RetrieveEpisodeOutput = location.state;

    const [imdbRating, setImdbRating] = useState<IMDBRating | null>(null)
    const [rtRating, setRtRating] = useState<RTRating | null>(null)
    const [serializdRating, setSerializdRating] = useState<string | null>(null)
    const [imdbLoading, setImdbLoading] = useState(true)
    const [rtLoading, setRtLoading] = useState(true)
    const [serializdLoading, setSerializdLoading] = useState(true)

    const airDate = new Date(episodeData.episode_airdata);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - airDate.getTime()) / (1000 * 60 * 60 * 24));

    const daysAgoLabel = diffDays === 0 
    ? "Today" 
    : diffDays === 1 
    ? "Yesterday" 
    : `${diffDays} days ago`;

    useEffect(() => {
        if (diffDays <= 3) {
            setChatOpen(true)
        }
    }, [diffDays])

    useEffect(() => {
        retrieveRatings(episodeData.show_name, episodeData.season_number, episodeData.episode_number)
            .then(data => {
                setImdbRating(data.imdb)
                setRtRating(data.rt)
                setSerializdRating(data.serializd)
            })
            .finally(() => {
                setImdbLoading(false)
                setRtLoading(false)
                setSerializdLoading(false)
            })
    }, [])
    
    return (
        <div className="bg-gray-50 min-h-screen">
            <Navbar/>
            <div className="flex flex-col lg:grid lg:grid-cols-[280px_1fr_280px] lg:gap-1">

                {/* Left Column */}
                <div className="flex flex-col gap-4 p-6 overflow-y-auto">
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                        <img className="absolute inset-0 w-full h-full object-cover" src={episodeData.show_image_url}/>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        <div className="absolute bottom-0 left-0 p-4">
                            <p className="text-white font-mono text-sm font-bold">{episodeData.show_name}</p>
                            <p className="text-zinc-300 text-xs">S{String(episodeData.season_number).padStart(2, '0')} E{String(episodeData.episode_number).padStart(2, '0')} - {episodeData.episode_title}</p>
                        </div>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
                        <p className="text-gray-400 text-xs uppercase font-mono tracking-widest">Air Date</p>
                        <p className="text-gray-900 text-sm mt-1">{episodeData.episode_airdata}</p>
                        <span className="text-xs bg-gray-100 border border-gray-200 rounded-full px-3 py-0.5 mt-2 inline-block text-gray-500">{daysAgoLabel}</span>
                    </div>
                    <button className="w-full py-2.5 rounded-lg border border-dashed border-gray-300 text-gray-400 font-mono text-xs tracking-wider hover:border-blue-400 hover:text-blue-400 transition-colors"
                        onClick={() => navigate("/")}
                    > ↩ Search Again
                    </button>
                </div>

                {/* Centre Column */}
                <div className="flex flex-col gap-4 p-6 overflow-y-auto">
                    <div className="flex flex-row gap-3">
                        <div className="flex flex-col gap-2 flex-1 bg-white border border-gray-200 shadow-sm rounded-xl p-4">
                            <p className="text-gray-400 text-xs font-mono tracking-widest uppercase">IMDb</p>
                            {imdbLoading ? <RatingSpinner /> : (
                                <>
                                    <p className="text-gray-900 text-3xl font-bold font-mono">{imdbRating?.aggregateRating ?? "N/A"}</p>
                                    <div className="h-1 bg-gray-200 rounded-full">
                                        <div className="h-1 bg-blue-500 rounded-full" style={{ width: `${imdbRating?.aggregateRating ? imdbRating.aggregateRating * 10 : 0}%` }} />
                                    </div>
                                    <p className="text-gray-400 text-xs">from {imdbRating?.voteCount?.toLocaleString() ?? "—"} ratings</p>
                                </>
                            )}
                        </div>
                        <div className="flex flex-col gap-2 flex-1 bg-white border border-gray-200 shadow-sm rounded-xl p-4">
                            <p className="text-gray-400 text-xs font-mono tracking-widest uppercase">Rotten Tomatoes</p>
                            {rtLoading ? <RatingSpinner /> : (
                                <>
                                    <p className="text-gray-900 text-3xl font-bold font-mono">{rtRating?.score ?? "N/A"}</p>
                                    <div className="h-1 bg-gray-200 rounded-full">
                                        <div className="h-1 bg-blue-500 rounded-full" style={{ width: rtRating?.score ? `${parseInt(rtRating.score)}%` : '0%' }} />
                                    </div>
                                    <p className="text-gray-400 text-xs">{rtRating?.review_count ? `from ${rtRating.review_count.toLocaleString()} reviews` : "—"}</p>
                                </>
                            )}
                        </div>
                        <div className="flex flex-col gap-2 flex-1 bg-white border border-gray-200 shadow-sm rounded-xl p-4">
                            <p className="text-gray-400 text-xs font-mono tracking-widest uppercase">Serializd</p>
                            {serializdLoading ? <RatingSpinner /> : (
                                <>
                                    <p className="text-gray-900 text-3xl font-bold font-mono">{serializdRating ?? "N/A"}</p>
                                    <div className="h-1 bg-gray-200 rounded-full">
                                        <div className="h-1 bg-blue-500 rounded-full" style={{ width: serializdRating ? `${(parseFloat(serializdRating) / 5) * 100}%` : '0%' }} />
                                    </div>
                                    <p className="text-gray-400 text-xs">from Serializd</p>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
                        <div
                            className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => setSentimentOpen(!sentimentOpen)}
                        >
                            <p className="text-gray-900 font-mono text-sm">AI Sentiment Analysis</p>
                            <span className="text-gray-400 text-xs">{sentimentOpen ? "▴" : "▾"}</span>
                        </div>
                        {sentimentOpen && (
                            <div className="px-4 pb-4 border-t border-gray-100">
                                <p className="text-gray-400 text-xs mt-4 mb-3">Based on reviews from online reviews</p>
                                <div className="flex h-6 rounded-lg overflow-hidden">
                                    <div className="bg-green-400 flex items-center justify-center text-white text-xs font-mono" style={{flex: 0.62}}>62%</div>
                                    <div className="bg-gray-300 flex items-center justify-center text-gray-500 text-xs font-mono" style={{flex: 0.25}}>25%</div>
                                    <div className="bg-red-400 flex items-center justify-center text-white text-xs font-mono" style={{flex: 0.13}}>13%</div>
                                </div>
                                <div className="flex gap-4 mt-3">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-green-400" />
                                        <span className="text-gray-400 text-xs">Positive</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-gray-300" />
                                        <span className="text-gray-400 text-xs">Neutral</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-red-400" />
                                        <span className="text-gray-400 text-xs">Negative</span>
                                    </div>
                                </div>
                                <p className="text-gray-500 text-xs italic mt-3 border-l-2 border-gray-200 pl-3">
                                    "Combined Review Yap Yap Yap..."
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
                        <div
                            className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => setCommunityOpen(!communityOpen)}
                        >
                            <p className="text-gray-900 font-mono text-sm">Community & Media</p>
                            <span className="text-gray-400 text-xs">{communityOpen ? "▴" : "▾"}</span>
                        </div>
                        {communityOpen && (
                            <div className="px-4 pb-4 border-t border-gray-100">
                                <div className="flex gap-2 mt-4 mb-3">
                                    <span className="px-3 py-1 rounded-full bg-blue-500 text-white text-xs font-mono cursor-pointer">Reddit</span>
                                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-mono cursor-pointer hover:bg-gray-200 transition-colors">Twitter</span>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-6 h-6 rounded-full bg-gray-200" />
                                            <span className="text-gray-400 text-xs font-mono">r/breakingbad · 4h ago</span>
                                            <span className="ml-auto text-blue-500 text-xs font-mono">▲ 1.2k</span>
                                        </div>
                                        <p className="text-gray-700 text-xs leading-relaxed">Reddit post content example.</p>
                                    </div>
                                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-5 h-5 rounded bg-gray-200" />
                                            <span className="text-gray-400 text-xs font-mono">Meme · Image</span>
                                            <span className="ml-auto text-orange-400 text-xs">🔥 hot</span>
                                        </div>
                                        <div className="w-full h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                                            <span className="text-gray-400 text-xs font-mono">[ image ]</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {/* Right Column */}
                <div className="flex flex-col h-[calc(100vh-40px)] sticky top-[40px] border-l border-gray-200">
                    {chatOpen && (
                        <>
                            <div className="p-4 border-b border-gray-200 bg-white">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                    <p className="text-gray-900 font-mono text-sm">Live Chat</p>
                                    <span className="ml-auto text-gray-400 text-xs font-mono">14 watching</span>
                                </div>
                                <p className="text-gray-400 text-xs mt-1">Episode aired 6 days ago</p>
                            </div>
                            {/* Messages */}
                            <div className="flex flex-col gap-3 p-4 overflow-y-auto flex-1">
                                <div className="flex flex-col gap-1">
                                    <span className="text-gray-400 text-xs font-mono">user1</span>
                                    <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-3 py-2 text-xs text-gray-700 max-w-[85%]">
                                        Example message
                                    </div>
                                </div>
                            </div>
                            {/* Input */}
                            <div className="p-4 border-t border-gray-200 bg-white flex gap-2">
                                <input
                                    className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-xs text-gray-700 outline-none placeholder:text-gray-400"
                                    placeholder="Say something..."
                                />
                                <button className="bg-blue-500 hover:bg-blue-600 transition-colors text-white text-xs font-mono px-4 py-2 rounded-full">
                                    Send
                                </button>
                            </div>
                        </>
                    )}
                    {!chatOpen && (
                        <div className="flex flex-col items-center justify-center h-full p-6 gap-4">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                <span className="text-gray-400 text-lg">💬</span>
                            </div>
                            <div className="text-center">
                                <p className="text-gray-900 font-mono text-sm font-medium">Live Chat Unavailable</p>
                                <p className="text-gray-400 text-xs mt-2 leading-relaxed">
                                    Live chat is only available for episodes released within the last 72 hours.
                                </p>
                            </div>
                            <div className="border border-dashed border-gray-200 rounded-xl p-4 w-full">
                                <p className="text-gray-400 text-xs text-center font-mono">
                                    Want to chat live with others?
                                </p>
                                <p className="text-blue-400 text-xs text-center font-mono mt-1 cursor-pointer hover:text-blue-500 transition-colors">
                                    Explore our Watch Parties
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function RatingSpinner() {
    return (
        <div className="flex items-center justify-center h-8">
            <div className="w-4 h-4 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
        </div>
    )
}

export default Episode

