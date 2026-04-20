import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate} from "react-router-dom";


import { getOrGenerateSentiment } from "@/api/shows/aiSentiment.ts";
import { insertPost, retrievePosts } from "@/api/shows/posts.ts";
import { retrieveIMDBRating, retrieveRTRating, retrieveSerializdRating } from "@/api/shows/ratings.ts";
import Navbar from "@/components/layout/navbar.tsx";
import { useAuth } from "@/context/authContext";
import { useChat } from "@/hooks/useChat";
import { type Episode } from "@/types/episode.ts";
import { type Post } from "@/types/posts.ts";
import { type IMDBRating, type RTRating } from "@/types/rating.ts";
import { type Sentiment } from "@/types/sentiment.ts";




export function EpisodePage() {

    const { username } = useAuth();
    const { accessToken } = useAuth();
    const navigate = useNavigate();
   
    const [numberOfPosts, setNumberOfPosts] = useState(0);
    const [noMorePosts, setNoMorePosts] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [isPosting, setIsPosting] = useState(false);
    const [posts, setPosts] = useState<Post[] | null>(null);

    const [sentimentOpen, setSentimentOpen] = useState(false);
    const [communityOpen, setCommunityOpen] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
    const location = useLocation();
    const episodeData: Episode = location.state;

    const [imdbRating, setImdbRating] = useState<IMDBRating | null>(null);
    const [rtRating, setRtRating] = useState<RTRating | null>(null);
    const [serializdRating, setSerializdRating] = useState<string | null>(null);
    const [imdbLoading, setImdbLoading] = useState(true);
    const [rtLoading, setRtLoading] = useState(true);
    const [serializdLoading, setSerializdLoading] = useState(true);

    const [sentimentData, setSentimentData] = useState<Sentiment | null>(null);
    const [sentimentLoading, setSentimentLoading] = useState(true);

    const airDate = new Date(episodeData.episodeAirdate);
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
            setChatOpen(true);
        }
    }, [diffDays]);

    useEffect(() => {
        retrieveIMDBRating(episodeData.showName, episodeData.seasonNumber, episodeData.episodeNumber)
            .then(data => setImdbRating(data))
            .finally(() => setImdbLoading(false))
    }, []);
    
    useEffect(() => {
        retrieveRTRating(episodeData.showName, episodeData.seasonNumber, episodeData.episodeNumber)
            .then(data => setRtRating(data))
            .finally(() => setRtLoading(false))
    }, []);
    
    useEffect(() => {
        retrieveSerializdRating(episodeData.showName, episodeData.seasonNumber, episodeData.episodeNumber)
            .then(data => setSerializdRating(data))
            .finally(() => setSerializdLoading(false))
    }, []);

    useEffect(() => {
        getOrGenerateSentiment(episodeData.showName, episodeData.seasonNumber, episodeData.episodeNumber)
            .then(data => {
                setSentimentData(data);
            })
            .finally(() => {
                setSentimentLoading(false);
            })
    }, []);

    const handleCommunityClick = async () => {
        const opening = !communityOpen;
        setCommunityOpen(opening);
        if (opening && posts === null) {
            try {
                const data = await retrievePosts(
                    episodeData.showName,
                    episodeData.seasonNumber,
                    episodeData.episodeNumber,
                    [0, 3]
                );
                setPosts([...data]);
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
                episodeData.showName,
                episodeData.seasonNumber,
                episodeData.episodeNumber,
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
                episodeData.showName,
                episodeData.seasonNumber,
                episodeData.episodeNumber,
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

    const { messages, viewerCount, sendMessage, error, connected } = useChat({
        showName: episodeData.showName,
        seasonNumber: episodeData.seasonNumber,
        episodeNumber: episodeData.episodeNumber,
        token: accessToken,
        enabled: chatOpen,
    });
    const [chatInput, setChatInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        const text = chatInput.trim();
        if (!text) return;
        sendMessage(text);
        setChatInput("");
    };
    
    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            <Navbar/>
            <div className="flex flex-col lg:grid lg:grid-cols-[280px_1fr_280px] lg:gap-1 lg:flex-1 lg:h-[calc(100vh-64px)] overflow-hidden">

                {/* Left Column */}
                <div className="flex flex-col gap-4 p-6 pt-1 overflow-y-auto">
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                        <img className="absolute inset-0 w-full h-full object-cover" src={episodeData.showImageURL}/>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        <div className="absolute bottom-0 left-0 p-4">
                            <p className="text-white font-mono text-sm font-bold">{episodeData.showName}</p>
                            <p className="text-zinc-300 text-xs">S{String(episodeData.seasonNumber).padStart(2, '0')} E{String(episodeData.episodeNumber).padStart(2, '0')} - {episodeData.episodeTitle}</p>
                        </div>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
                        <p className="text-gray-400 text-xs uppercase font-mono tracking-widest">Air Date</p>
                        <p className="text-gray-900 text-sm mt-1">{episodeData.episodeAirdate}</p>
                        <span className="text-xs bg-gray-100 border border-gray-200 rounded-full px-3 py-0.5 mt-2 inline-block text-gray-500">{daysAgoLabel}</span>
                    </div>
                    <button className="w-full py-2.5 rounded-lg border border-dashed border-gray-300 text-gray-400 font-mono text-xs tracking-wider hover:border-blue-400 hover:text-blue-400 transition-colors"
                        onClick={() => navigate("/")}
                    > ↩ Search Again
                    </button>
                </div>

                {/* Centre Column */}
                <div className="flex flex-col gap-4 p-6 pt-1 overflow-y-auto">
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
                                    <p className="text-gray-400 text-xs">{rtRating?.reviewCount ? `from ${rtRating.reviewCount.toLocaleString()} reviews` : "—"}</p>
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

                {/* Right Column - Live Chat */}
                <div className="flex flex-col p-6 pt-1 pr-0 pb-0 overflow-hidden">
                    <div className="flex flex-col border-l border-t border-gray-200 flex-1 overflow-hidden bg-white">
                        {chatOpen ? (
                            <>
                                {/* Header */}
                                <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-400 animate-pulse" : "bg-gray-300"}`} />
                                        <p className="text-gray-900 font-mono text-sm">Live Chat</p>
                                        <span className="ml-auto text-gray-400 text-xs font-mono">
                                            {viewerCount} Users
                                        </span>
                                    </div>
                                    <p className="text-gray-400 text-xs mt-1">
                                        {daysAgoLabel} · {connected ? "Connected" : "Reconnecting..."}
                                    </p>
                                </div>

                                {/* Error banner */}
                                {error && (
                                    <div className="mx-4 mt-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg flex-shrink-0">
                                        <p className="text-red-500 text-xs font-mono">{error}</p>
                                    </div>
                                )}

                                {/* Messages */}
                                <div className="flex flex-col gap-3 p-4 overflow-y-auto flex-1 min-h-0">
                                    {messages.map((msg, i) => (
                                        <div key={msg.id ?? i} className="flex flex-col gap-1">
                                            <span className="text-gray-400 text-xs font-mono">{msg.username}</span>
                                            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-3 py-2 text-xs text-gray-700 max-w-[85%]">
                                                {msg.message}
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input — or login prompt */}
                                <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
                                    {username ? (
                                        <div className="flex gap-2">
                                            <input
                                                className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-xs text-gray-700 outline-none placeholder:text-gray-400"
                                                placeholder="Say something..."
                                                value={chatInput}
                                                maxLength={500}
                                                onChange={e => setChatInput(e.target.value)}
                                                onKeyDown={e => e.key === "Enter" && handleSend()}
                                            />
                                            <button
                                                className="bg-blue-500 hover:bg-blue-600 disabled:opacity-40 transition-colors text-white text-xs font-mono px-4 py-2 rounded-full"
                                                onClick={handleSend}
                                                disabled={!chatInput.trim() || !connected}
                                            >
                                                Send
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="text-gray-400 text-xs text-center font-mono">
                                            <a href="/login" className="text-blue-400 hover:text-blue-500 transition-colors">
                                                Log in
                                            </a>{" "}
                                            to send messages
                                        </p>
                                    )}
                                </div>
                            </>
                        ) : (
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
                            </div>
                        )}
                    </div>
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

export default EpisodePage;