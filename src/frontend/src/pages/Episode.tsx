import Navbar from "../components/layout/navbar.tsx"
import { useState, useEffect } from "react"
import { retrieveIMDBRating, retrieveRTRating, retrieveSerializdRating } from "../api/shows/ratings.ts";
import { getOrGenerateSentiment } from "../api/shows/ai-sentiment.ts";
import { useLocation, useNavigate} from "react-router-dom";
import { type RetrieveEpisodeOutput, type IMDBRating, type RTRating, type RetrieveSentimentAnalysisOutput, type PostOutput } from "../api/shows/types.ts";
import { insertPost, retrievePosts } from "@/api/shows/posts.ts";
import { useAuth } from "../context/authContext";

export function Episode() {

    const { username } = useAuth();
    const navigate = useNavigate();
   
    const [numberOfPosts, setNumberOfPosts] = useState(0)
    const [noMorePosts, setNoMorePosts] = useState(false)
    const [newMessage, setNewMessage] = useState("")
    const [isPosting, setIsPosting] = useState(false)
    const [posts, setPosts] = useState<PostOutput[] | null>(null)

    const [sentimentOpen, setSentimentOpen] = useState(false)
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

    const [sentimentData, setSentimentData] = useState<RetrieveSentimentAnalysisOutput | null>(null)
    const [sentimentLoading, setSentimentLoading] = useState(true)

    const airDate = new Date(episodeData.episode_airdata);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - airDate.getTime()) / (1000 * 60 * 60 * 24));

    const daysAgoLabel = diffDays === 0 
    ? "Today" 
    : diffDays === 1 
    ? "Yesterday" 
    : `${diffDays} days ago`;

    let positivePercent = 0, neutralPercent = 0, negativePercent = 0;
    if (sentimentData) {
        const total = sentimentData.positive + sentimentData.neutral + sentimentData.negative;
        if (total > 0) {
            positivePercent = Math.round((sentimentData.positive / total) * 100);
            neutralPercent = Math.round((sentimentData.neutral / total) * 100);
            negativePercent = Math.round((sentimentData.negative / total) * 100);
    }}

    useEffect(() => {
        if (diffDays <= 3) {
            setChatOpen(true)
        }
    }, [diffDays])

    useEffect(() => {
        retrieveIMDBRating(episodeData.show_name, episodeData.season_number, episodeData.episode_number)
            .then(data => setImdbRating(data))
            .finally(() => setImdbLoading(false))
    }, [])
    
    useEffect(() => {
        retrieveRTRating(episodeData.show_name, episodeData.season_number, episodeData.episode_number)
            .then(data => setRtRating(data))
            .finally(() => setRtLoading(false))
    }, [])
    
    useEffect(() => {
        retrieveSerializdRating(episodeData.show_name, episodeData.season_number, episodeData.episode_number)
            .then(data => setSerializdRating(data))
            .finally(() => setSerializdLoading(false))
    }, [])

    useEffect(() => {
        getOrGenerateSentiment(episodeData.show_name, episodeData.season_number, episodeData.episode_number)
            .then(data => {
                setSentimentData(data)
            })
            .finally(() => {
                setSentimentLoading(false)
            })
    }, [])

    const handleCommunityClick = async () => {
        const opening = !communityOpen;
        setCommunityOpen(opening);
        if (opening && posts === null) {
            try {
                const data = await retrievePosts(
                    episodeData.show_name,
                    episodeData.season_number,
                    episodeData.episode_number,
                    [0, 3]
                );
                setPosts([...data].reverse());
                setNumberOfPosts(3);
                if (data.length < 3) setNoMorePosts(true);
            } catch {
                setPosts([]);
                setNoMorePosts(true);
            }
        }
    };
    
    const handleGetMore = async () => {
        try {
            const data = await retrievePosts(
                episodeData.show_name,
                episodeData.season_number,
                episodeData.episode_number,
                [numberOfPosts, numberOfPosts + 3]
            );
            if (data.length === 0) {
                setNoMorePosts(true);
            } else {
                setPosts(prev => [...(prev ?? []), ...data]);
                setNumberOfPosts(n => n + data.length);
                if (data.length < 3) setNoMorePosts(true);
            }
        } catch {
            setNoMorePosts(true);
        }
    };
    
    const handleSubmitPost = async () => {
        if (!newMessage.trim() || !username || isPosting) return;
        setIsPosting(true);
        try {
            const post = await insertPost(
                newMessage.trim(),
                username,
                episodeData.show_name,
                episodeData.season_number,
                episodeData.episode_number,
                "text"
            );
            setPosts(prev => [post, ...(prev ?? [])]);
            setNewMessage("");
            setNumberOfPosts(n => n + 1);
        } catch (err) {
            console.error(err);
        } finally {
            setIsPosting(false);
        }
    };
    
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
                                {sentimentLoading || !sentimentData ? <RatingSpinner /> : (
                                    <>
                                    <p className="text-gray-400 text-xs mt-4 mb-3">Based on reviews from Imdb and Rotten Tomatoes</p>
                                        <div className="flex h-6 rounded-lg overflow-hidden">
                                        <div className="bg-green-400 flex items-center justify-center text-white text-xs font-mono" style={{ flex: positivePercent }} > {positivePercent}% </div>
                                        <div className="bg-gray-300 flex items-center justify-center text-gray-500 text-xs font-mono" style={{ flex: neutralPercent }} > {neutralPercent}% </div>
                                        <div className="bg-red-400 flex items-center justify-center text-white text-xs font-mono" style={{ flex: negativePercent }} > {negativePercent}% </div>
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
                                            "{sentimentData.summary}"
                                        </p>
                                    </>
                                )}   
                            </div>
                        )}
                    </div>
                    <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
                        <div
                            className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={handleCommunityClick}
                        >
                            <p className="text-gray-900 font-mono text-sm">Community & Media</p>
                            <span className="text-gray-400 text-xs">{communityOpen ? "▴" : "▾"}</span>
                        </div>
                        {communityOpen && (
                            <div className="px-4 pb-4 border-t border-gray-100">
                                {/* Post input */}
                                {username ? (
                                    <div className="mt-4 flex flex-col gap-2">
                                        <textarea
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 outline-none placeholder:text-gray-400 resize-none focus:border-blue-300 transition-colors"
                                            placeholder="Share your thoughts on this episode..."
                                            rows={3}
                                            maxLength={300}
                                            value={newMessage}
                                            onChange={e => setNewMessage(e.target.value)}
                                        />
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-400 text-xs font-mono">{newMessage.length}/300</span>
                                            <button
                                                className="bg-blue-500 hover:bg-blue-600 disabled:opacity-40 transition-colors text-white text-xs font-mono px-4 py-1.5 rounded-full"
                                                onClick={handleSubmitPost}
                                                disabled={!newMessage.trim() || isPosting}
                                            >
                                                {isPosting ? "Posting..." : "Post"}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-400 text-xs mt-4 font-mono text-center">
                                        Log in to leave a comment
                                    </p>
                                )}

                                {/* Posts list */}
                                <div className="flex flex-col gap-3 mt-4">
                                    {posts === null ? (
                                        <RatingSpinner />
                                    ) : posts.length === 0 && noMorePosts ? (
                                        <p className="text-gray-400 text-xs font-mono text-center py-2">
                                            No posts yet. Be the first!
                                        </p>
                                    ) : (
                                        <>
                                            {posts.map(post => (
                                                <div key={post.id} className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                                                    <span className="text-blue-500 text-xs font-mono font-semibold">
                                                        {post.username}
                                                    </span>
                                                    <p className="text-gray-700 text-xs leading-relaxed mt-1">
                                                        {post.message}
                                                    </p>
                                                </div>
                                            ))}
                                            {noMorePosts ? (
                                                <button
                                                    className="w-full py-2 rounded-lg border border-dashed border-gray-200 text-gray-300 font-mono text-xs cursor-default"
                                                    disabled
                                                >
                                                    No more posts to load
                                                </button>
                                            ) : (
                                                <button
                                                    className="w-full py-2 rounded-lg border border-dashed border-gray-300 text-gray-400 font-mono text-xs hover:border-blue-400 hover:text-blue-400 transition-colors"
                                                    onClick={handleGetMore}
                                                >
                                                    Get More
                                                </button>
                                            )}
                                        </>
                                    )}
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