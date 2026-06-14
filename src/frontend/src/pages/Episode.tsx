import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate} from "react-router-dom";


import { PhotoIcon, XMarkIcon, PencilSquareIcon, TrashIcon, CheckIcon } from "@heroicons/react/24/outline";
import { getOrGenerateSentiment } from "@/api/shows/aiSentiment.ts";
import { insertPost, retrievePosts, likePost, editPost, deletePost } from "@/api/shows/posts.ts";
import { fetchComments, createComment, editComment, deleteComment } from "@/api/shows/comments.ts";
import { retrieveIMDBRating, retrieveRTRating, retrieveSerializdRating } from "@/api/shows/ratings.ts";
import Navbar from "@/components/layout/navbar.tsx";
import { useAuth } from "@/context/authContext";
import { useChat } from "@/hooks/useChat";
import { type ReplyTo } from "@/types/chat";
import { type Episode } from "@/types/episode.ts";
import { type Post } from "@/types/posts.ts";
import { type Comment } from "@/types/comments.ts";
import { type IMDBRating, type RTRating } from "@/types/rating.ts";
import { type Sentiment } from "@/types/sentiment.ts";
import { fetchUser, fetchFollowedShows, insertFollowShowRelationship, deleteFollowShowRelationship } from "@/api/social/socialNetwork";
import { simpleFetchShow } from "@/api/shows/shows";




function EpisodePostCard({ post, currentUsername, onDelete }: { post: Post; currentUsername: string | null; onDelete: (id: number) => void }) {
    const [liked, setLiked] = useState(post.user_has_liked);
    const [likeCount, setLikeCount] = useState(post.likes);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(post.message);
    const [displayMessage, setDisplayMessage] = useState(post.message);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [commentCount, setCommentCount] = useState(post.comment_count);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<Comment[] | null>(null);
    const [commentLoading, setCommentLoading] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [editingCommentText, setEditingCommentText] = useState("");
    const [isSavingComment, setIsSavingComment] = useState(false);

    const isOwner = currentUsername === post.username;

    const handleLike = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!currentUsername) return;
        const next = !liked;
        setLiked(next);
        setLikeCount(c => c + (next ? 1 : -1));
        try {
            const result = await likePost(post.id, currentUsername);
            setLikeCount(result.likes);
            setLiked(result.liked);
        } catch {
            setLiked(!next);
            setLikeCount(c => c + (next ? -1 : 1));
        }
    };

    const handleSaveEdit = async () => {
        if (!editText.trim() || isSaving || !currentUsername) return;
        setIsSaving(true);
        try {
            const updated = await editPost(post.id, currentUsername, editText.trim());
            setDisplayMessage(updated.message);
            setIsEditing(false);
        } catch {
            // silently ignore
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (isDeleting || !currentUsername) return;
        setIsDeleting(true);
        try {
            await deletePost(post.id, currentUsername);
            onDelete(post.id);
        } catch {
            setIsDeleting(false);
        }
    };

    const handleToggleComments = async () => {
        const next = !showComments;
        setShowComments(next);
        if (next && comments === null) {
            setCommentLoading(true);
            try {
                const data = await fetchComments(post.id);
                setComments(data);
            } catch {
                setComments([]);
            } finally {
                setCommentLoading(false);
            }
        }
    };

    const handleSubmitComment = async () => {
        if (!newComment.trim() || !currentUsername || isSubmittingComment) return;
        setIsSubmittingComment(true);
        try {
            const comment = await createComment(post.id, currentUsername, newComment.trim());
            setComments(prev => [...(prev ?? []), comment]);
            setCommentCount(c => c + 1);
            setNewComment("");
        } catch {
            // silently ignore
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleSaveComment = async () => {
        if (!editingCommentText.trim() || !currentUsername || isSavingComment || editingCommentId === null) return;
        setIsSavingComment(true);
        try {
            const updated = await editComment(post.id, editingCommentId, currentUsername, editingCommentText.trim());
            setComments(prev => (prev ?? []).map(c => c.id === editingCommentId ? updated : c));
            setEditingCommentId(null);
        } catch {
            // silently ignore
        } finally {
            setIsSavingComment(false);
        }
    };

    const handleDeleteComment = async (commentId: number) => {
        if (!currentUsername) return;
        try {
            await deleteComment(post.id, commentId, currentUsername);
            setComments(prev => (prev ?? []).filter(c => c.id !== commentId));
            setCommentCount(c => c - 1);
        } catch {
            // silently ignore
        }
    };

    return (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <span className="text-blue-500 text-xs font-mono font-semibold">{post.username}</span>
                {isOwner && !isEditing && (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => { setEditText(displayMessage); setIsEditing(true); }}
                            className="text-gray-300 hover:text-blue-400 transition-colors p-1"
                            title="Edit post"
                        >
                            <PencilSquareIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="text-gray-300 hover:text-red-400 transition-colors p-1 disabled:opacity-40"
                            title="Delete post"
                        >
                            <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
            </div>
            {isEditing ? (
                <div className="flex flex-col gap-2">
                    <textarea
                        className="w-full bg-white border border-blue-200 rounded-lg px-2 py-1.5 text-xs text-gray-700 outline-none resize-none focus:border-blue-400 transition-colors"
                        rows={3}
                        maxLength={300}
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        autoFocus
                    />
                    <div className="flex items-center justify-end gap-2">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="text-gray-400 hover:text-gray-600 text-xs font-mono transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveEdit}
                            disabled={!editText.trim() || isSaving}
                            className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white text-xs font-mono px-3 py-1 rounded-full transition-colors"
                        >
                            <CheckIcon className="w-3 h-3" />
                            {isSaving ? "Saving..." : "Save"}
                        </button>
                    </div>
                </div>
            ) : (
                <p className="text-gray-700 text-xs leading-relaxed">{displayMessage}</p>
            )}
            {post.media_url && (
                <img
                    src={post.media_url}
                    alt="post media"
                    className="w-full max-h-48 object-contain rounded-lg border border-gray-100"
                />
            )}
            <div className="flex items-center gap-4 pt-1 border-t border-gray-100">
                <button
                    onClick={handleLike}
                    disabled={!currentUsername}
                    className={`flex items-center gap-1.5 text-xs font-mono transition-colors disabled:opacity-40 ${
                        liked ? "text-blue-500" : "text-gray-400 hover:text-blue-400"
                    }`}
                >
                    <span>{liked ? "♥" : "♡"}</span>
                    <span>{likeCount}</span>
                </button>
                <button
                    onClick={handleToggleComments}
                    className="flex items-center gap-1.5 text-xs font-mono text-gray-400 hover:text-blue-400 transition-colors"
                >
                    <span>💬</span>
                    <span>
                        {commentCount > 0
                            ? `${commentCount} · ${showComments ? "Hide" : "Show"}`
                            : showComments ? "Hide" : "Comment"}
                    </span>
                </button>
                <button className="ml-auto text-gray-300 hover:text-gray-500 text-xs font-mono transition-colors">
                    Share
                </button>
            </div>

            {showComments && (
                <div className="border-t border-gray-100 pt-2 flex flex-col gap-2">
                    {currentUsername ? (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleSubmitComment()}
                                placeholder="Add a comment..."
                                maxLength={300}
                                className="flex-1 bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-700 outline-none focus:border-blue-300 transition-colors"
                            />
                            <button
                                onClick={handleSubmitComment}
                                disabled={!newComment.trim() || isSubmittingComment}
                                className="bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white text-xs font-mono px-3 py-1 rounded-full transition-colors"
                            >
                                {isSubmittingComment ? "..." : "Post"}
                            </button>
                        </div>
                    ) : (
                        <p className="text-gray-400 text-xs font-mono text-center">Log in to comment</p>
                    )}
                    {commentLoading && (
                        <p className="text-gray-400 text-xs font-mono text-center py-1">Loading...</p>
                    )}
                    {comments && comments.length === 0 && !commentLoading && (
                        <p className="text-gray-400 text-xs font-mono text-center py-1">No comments yet</p>
                    )}
                    {comments && comments.map(c => (
                        <div key={c.id} className="flex items-start gap-2">
                            {editingCommentId === c.id ? (
                                <>
                                    <input
                                        type="text"
                                        value={editingCommentText}
                                        onChange={e => setEditingCommentText(e.target.value)}
                                        onKeyDown={e => { if (e.key === "Enter") handleSaveComment(); if (e.key === "Escape") setEditingCommentId(null); }}
                                        maxLength={300}
                                        autoFocus
                                        className="flex-1 bg-white border border-blue-200 rounded px-2 py-0.5 text-xs text-gray-700 outline-none focus:border-blue-400 transition-colors"
                                    />
                                    <button
                                        onClick={handleSaveComment}
                                        disabled={!editingCommentText.trim() || isSavingComment}
                                        className="text-blue-500 hover:text-blue-600 disabled:opacity-40 text-xs font-mono transition-colors flex-shrink-0"
                                    >
                                        {isSavingComment ? "..." : "Save"}
                                    </button>
                                    <button
                                        onClick={() => setEditingCommentId(null)}
                                        className="text-gray-400 hover:text-gray-600 text-xs font-mono transition-colors flex-shrink-0"
                                    >
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <>
                                    <span className="text-blue-500 text-xs font-mono font-semibold flex-shrink-0">{c.username}</span>
                                    <span className="text-gray-600 text-xs flex-1 leading-relaxed">{c.message}</span>
                                    {currentUsername === c.username && (
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <button
                                                onClick={() => { setEditingCommentId(c.id); setEditingCommentText(c.message); }}
                                                className="text-gray-300 hover:text-blue-400 transition-colors p-0.5"
                                                title="Edit comment"
                                            >
                                                <PencilSquareIcon className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteComment(c.id)}
                                                className="text-gray-300 hover:text-red-400 transition-colors p-0.5"
                                                title="Delete comment"
                                            >
                                                <TrashIcon className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export function EpisodePage() {

    const { username } = useAuth();
    const { accessToken } = useAuth();
    const navigate = useNavigate();

    const [numberOfPosts, setNumberOfPosts] = useState(0);
    const [noMorePosts, setNoMorePosts] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [isPosting, setIsPosting] = useState(false);
    const [posts, setPosts] = useState<Post[] | null>(null);
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [mediaError, setMediaError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isFollowingShow, setIsFollowingShow] = useState(false);
    const [followShowLoading, setFollowShowLoading] = useState(false);
    const [userId, setUserId] = useState<number | null>(null);

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
        if (!username) return;
        (async () => {
            try {
                const user = await fetchUser(username);
                setUserId(user.id);
                let shows: string[] = [];
                try { shows = await fetchFollowedShows(user.id); } catch { /* no followed shows */ }
                setIsFollowingShow(shows.includes(episodeData.showName));
            } catch { /* user not found */ }
        })();
    }, [username]);

    const handleFollowShow = async () => {
        if (!username || userId === null || followShowLoading) return;
        setFollowShowLoading(true);
        try {
            const show = await simpleFetchShow(episodeData.showName);
            if (isFollowingShow) {
                await deleteFollowShowRelationship(userId, show.id);
            } else {
                await insertFollowShowRelationship(userId, show.id);
            }
            setIsFollowingShow(prev => !prev);
        } catch {
            // silently ignore
        } finally {
            setFollowShowLoading(false);
        }
    };

    const handleDeletePost = (postId: number) => {
        setPosts(prev => (prev ?? []).filter(p => p.id !== postId));
        setNumberOfPosts(n => n - 1);
    };

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
                    [0, 3],
                    username ?? undefined
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
                [numberOfPosts, numberOfPosts + 3],
                username ?? undefined
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
    
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!['image/jpeg', 'image/png'].includes(file.type)) {
            setMediaError("Only JPEG and PNG images are allowed");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setMediaError("Image must be under 5 MB");
            return;
        }
        setMediaError(null);
        setMediaFile(file);
        setMediaPreview(URL.createObjectURL(file));
    };

    const clearMedia = () => {
        if (mediaPreview) URL.revokeObjectURL(mediaPreview);
        setMediaFile(null);
        setMediaPreview(null);
        setMediaError(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
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
                "text",
                mediaFile ?? undefined,
            );
            setPosts(prev => [post, ...(prev ?? [])]);
            setNewMessage("");
            clearMedia();
            setNumberOfPosts(n => n + 1);
        } catch (err) {
            console.error(err);
        } finally {
            setIsPosting(false);
        }
    };

    const { messages, viewerCount, sendMessage, sendReaction, error, connected } = useChat({
        showName: episodeData.showName,
        seasonNumber: episodeData.seasonNumber,
        episodeNumber: episodeData.episodeNumber,
        token: accessToken,
        username,
        enabled: chatOpen,
    });
    const [chatInput, setChatInput] = useState("");
    const [replyTo, setReplyTo] = useState<ReplyTo | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const REACTION_EMOJIS = ["👍", "😂", "❤️", "😮", "😢"] as const;

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        const text = chatInput.trim();
        if (!text) return;
        sendMessage(text, replyTo?.id ?? null);
        setReplyTo(null);
        setChatInput("");
    };
    
    return (
        <div className="bg-gray-50 min-h-screen lg:h-screen flex flex-col">
            <Navbar/>
            <div className="flex flex-col lg:grid lg:grid-cols-[280px_1fr_280px] lg:auto-rows-fr lg:gap-1 lg:flex-1 lg:overflow-hidden">

                {/* Left Column */}
                <div className="flex flex-col gap-4 p-6 pt-1 overflow-y-auto min-h-0">
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
                    {username && (
                        <button
                            onClick={handleFollowShow}
                            disabled={followShowLoading}
                            className={`w-full py-2.5 rounded-lg border font-mono text-xs tracking-wider transition-colors disabled:opacity-50 ${
                                isFollowingShow
                                    ? "border-blue-400 text-blue-500 bg-blue-50 hover:bg-red-50 hover:border-red-300 hover:text-red-400"
                                    : "border-dashed border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-400"
                            }`}
                        >
                            {followShowLoading ? "..." : isFollowingShow ? "✓ Following Show" : "+ Follow Show"}
                        </button>
                    )}
                    <button className="w-full py-2.5 rounded-lg border border-dashed border-gray-300 text-gray-400 font-mono text-xs tracking-wider hover:border-blue-400 hover:text-blue-400 transition-colors"
                        onClick={() => navigate("/")}
                    > ↩ Search Again
                    </button>
                </div>

                {/* Centre Column */}
                <div className="flex flex-col gap-4 p-6 pt-1 min-h-0 overflow-hidden">
                    {/* Ratings row — fixed, never shrinks */}
                    <div className="flex flex-row gap-3 flex-shrink-0">
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

                    {/* Sentiment — fixed, never shrinks */}
                    <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden flex-shrink-0">
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

                    {/* Community & Media — stretches to fill remaining space when open */}
                    <div className={`bg-white border border-gray-200 shadow-sm rounded-xl flex flex-col min-h-0 ${communityOpen ? 'flex-1' : 'flex-shrink-0'}`}>
                        {/* Header — always fixed */}
                        <div
                            className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors flex-shrink-0"
                            onClick={handleCommunityClick}
                        >
                            <p className="text-gray-900 font-mono text-sm">Community & Media</p>
                            <span className="text-gray-400 text-xs">{communityOpen ? "▴" : "▾"}</span>
                        </div>

                        {communityOpen && (
                            <div className="flex flex-col gap-3 flex-1 min-h-0 overflow-y-auto border-t border-gray-100 px-4 py-4">
                                {/* Post input */}
                                {username ? (
                                    <div className="flex flex-col gap-2">
                                        <textarea
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 outline-none placeholder:text-gray-400 resize-none focus:border-blue-300 transition-colors"
                                            placeholder="Share your thoughts on this episode..."
                                            rows={2}
                                            maxLength={300}
                                            value={newMessage}
                                            onChange={e => setNewMessage(e.target.value)}
                                        />
                                        <div className="flex items-center gap-2">
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/jpeg,image/png"
                                                className="hidden"
                                                onChange={handleFileSelect}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="flex items-center gap-1 text-gray-400 hover:text-blue-400 transition-colors text-xs font-mono cursor-pointer"
                                            >
                                                <PhotoIcon className="w-4 h-4" />
                                                <span>Photo</span>
                                            </button>
                                            {mediaPreview && (
                                                <div className="relative flex-shrink-0">
                                                    <img src={mediaPreview} className="h-8 w-8 rounded object-cover border border-gray-200" />
                                                    <button
                                                        type="button"
                                                        onClick={clearMedia}
                                                        className="absolute -top-1 -right-1 bg-gray-700 rounded-full p-0.5 cursor-pointer"
                                                    >
                                                        <XMarkIcon className="w-2.5 h-2.5 text-white" />
                                                    </button>
                                                </div>
                                            )}
                                            {mediaError && (
                                                <span className="text-red-400 text-xs font-mono">{mediaError}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-400 text-xs font-mono">{newMessage.length}/300</span>
                                            <button
                                                className="bg-blue-500 hover:bg-blue-600 disabled:opacity-40 transition-colors text-white text-xs font-mono px-4 py-1.5 rounded-full cursor-pointer"
                                                onClick={handleSubmitPost}
                                                disabled={!newMessage.trim() || isPosting}
                                            >
                                                {isPosting ? "Posting..." : "Post"}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-400 text-xs font-mono text-center">
                                        Log in to leave a comment
                                    </p>
                                )}

                                {/* Posts list */}
                                {posts === null ? (
                                    <RatingSpinner />
                                ) : posts.length === 0 && noMorePosts ? (
                                    <p className="text-gray-400 text-xs font-mono text-center py-2">
                                        No posts yet. Be the first!
                                    </p>
                                ) : (
                                    <>
                                        {posts.map(post => (
                                            <EpisodePostCard key={post.id} post={post} currentUsername={username} onDelete={handleDeletePost} />
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
                        )}
                    </div>
                </div>

                {/* Right Column - Live Chat */}
                <div className="flex flex-col p-6 pt-1 pr-0 pb-0 overflow-hidden min-h-0">
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
                                        <div key={msg.id ?? i} className="flex flex-col gap-1 group">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-400 text-xs font-mono">{msg.username}</span>
                                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {REACTION_EMOJIS.map(emoji => (
                                                        <button
                                                            key={emoji}
                                                            onClick={() => username && sendReaction(msg.id, emoji)}
                                                            className={`text-sm leading-none px-1 py-0.5 rounded hover:bg-gray-100 transition-colors ${msg.user_reactions?.includes(emoji) ? "bg-blue-50" : ""}`}
                                                            title={username ? undefined : "Log in to react"}
                                                        >
                                                            {emoji}
                                                        </button>
                                                    ))}
                                                    <button
                                                        onClick={() => setReplyTo({ id: msg.id, username: msg.username, message: msg.message })}
                                                        className="ml-0.5 text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded hover:bg-gray-100"
                                                        title="Reply"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="9 17 4 12 9 7" />
                                                            <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-3 py-2 text-xs text-gray-700 max-w-[85%]">
                                                {msg.reply_to_id && (
                                                    <div className="mb-2 px-2 py-1 bg-gray-50 border-l-2 border-blue-300 rounded-sm">
                                                        <p className="text-blue-400 font-mono text-xs">{msg.reply_to_username}</p>
                                                        <p className="text-gray-400 text-xs truncate">{msg.reply_to_message}</p>
                                                    </div>
                                                )}
                                                {msg.message}
                                            </div>
                                            {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                                                <div className="flex flex-wrap gap-1 max-w-[85%]">
                                                    {Object.entries(msg.reactions).map(([emoji, count]) => (
                                                        <button
                                                            key={emoji}
                                                            onClick={() => username && sendReaction(msg.id, emoji)}
                                                            className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs border transition-colors ${
                                                                msg.user_reactions?.includes(emoji)
                                                                    ? "bg-blue-50 border-blue-200 text-blue-600"
                                                                    : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                                                            }`}
                                                        >
                                                            <span>{emoji}</span>
                                                            <span className="font-mono">{count}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Reply preview */}
                                {replyTo && (
                                    <div className="mx-4 mb-0 px-3 py-2 bg-blue-50 border-t border-x border-blue-100 rounded-t-lg flex items-start gap-2 flex-shrink-0">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-mono text-blue-500">Replying to {replyTo.username}</p>
                                            <p className="text-xs text-gray-500 truncate">{replyTo.message}</p>
                                        </div>
                                        <button
                                            onClick={() => setReplyTo(null)}
                                            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 text-base leading-none"
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}

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