import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MagnifyingGlassIcon, FireIcon, ChatBubbleLeftRightIcon, UserPlusIcon, CheckIcon } from "@heroicons/react/24/outline";
import Navbar from "@/components/layout/navbar";
import { useAuth } from "@/context/authContext";
import { fetchFeedPosts, fetchTrendingShows, fetchLiveChats, searchUsers } from "@/api/feed/feed";
import type { FeedPost, TrendingShow, LiveChat, UserSearchResult } from "@/api/feed/feed.types";
import { insertFollowUserRelationship, deleteFollowUserRelationship, fetchUser } from "@/api/social/socialNetwork";
import { retrieveEpisode } from "@/api/shows/episodes";
import { simpleFetchShow } from "@/api/shows/shows";


function relativeTime(isoString: string): string {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function padNum(n: number) {
  return String(n).padStart(2, "0");
}

function Spinner() {
  return (
    <div className="flex items-center justify-center h-8">
      <div className="w-4 h-4 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );
}

function PostCard({ post }: { post: FeedPost }) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
          <span className="text-blue-400 text-xs font-mono font-bold">
            {post.username[0].toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-blue-500 text-xs font-mono font-semibold">{post.username}</span>
          <p className="text-gray-400 text-xs truncate">
            {post.show_name} · S{padNum(post.season)} E{padNum(post.episode)} — {post.episode_title}
          </p>
        </div>
        <span className="text-gray-300 text-xs font-mono flex-shrink-0">{relativeTime(post.created_at)}</span>
      </div>

      <div className="flex gap-3">
        {post.thumbnail ? (
          <img
            src={post.thumbnail}
            alt={post.show_name}
            className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-gray-100"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 border border-gray-100" />
        )}
        <p className="text-gray-700 text-sm leading-relaxed flex-1">{post.message}</p>
      </div>

      <div className="flex items-center gap-4 pt-1 border-t border-gray-50">
        <button
          onClick={() => setLiked(!liked)}
          className={`flex items-center gap-1.5 text-xs font-mono transition-colors ${
            liked ? "text-blue-500" : "text-gray-400 hover:text-blue-400"
          }`}
        >
          <span>{liked ? "♥" : "♡"}</span>
          <span>{post.likes + (liked ? 1 : 0)}</span>
        </button>
        <button className="text-gray-400 hover:text-gray-600 text-xs font-mono transition-colors">
          Reply
        </button>
        <button className="ml-auto text-gray-300 hover:text-gray-500 text-xs font-mono transition-colors">
          Share
        </button>
      </div>
    </div>
  );
}

function UserSearchWidget({ currentUsername }: { currentUsername: string | null }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [followed, setFollowed] = useState<Record<string, boolean>>({});
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await searchUsers(query, currentUsername ?? undefined);
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, currentUsername]);

  const toggleFollow = async (username: string) => {
    if (!currentUsername) return;
    try {
      const currentUser = await fetchUser(currentUsername);
      const targetUser = await fetchUser(username);
      if (followed[username]) {
        await deleteFollowUserRelationship(currentUser.id, targetUser.id);
        setFollowed((prev) => ({ ...prev, [username]: false }));
      } else {
        await insertFollowUserRelationship(currentUser.id, targetUser.id);
        setFollowed((prev) => ({ ...prev, [username]: true }));
      }
    } catch {
      // silently ignore follow errors
    }
  };

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 flex flex-col gap-3">
      <p className="text-gray-400 text-xs uppercase font-mono tracking-widest">Find Users</p>

      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by username..."
          className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-xs text-gray-700 placeholder:text-gray-400 outline-none focus:border-blue-300 transition-colors"
        />
      </div>

      {searching && <Spinner />}

      {!searching && results.length > 0 && (
        <div className="flex flex-col gap-2">
          {results.map((u) => (
            <div key={u.username} className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <span className="text-gray-500 text-xs font-mono font-bold">
                  {u.username[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-800 text-xs font-mono truncate">{u.username}</p>
                {u.mutuals > 0 && (
                  <p className="text-gray-400 text-xs">
                    {u.mutuals} mutual{u.mutuals > 1 ? "s" : ""}
                  </p>
                )}
              </div>
              <button
                onClick={() => toggleFollow(u.username)}
                disabled={!currentUsername}
                className={`flex items-center gap-1 text-xs font-mono px-2.5 py-1 rounded-full border transition-colors disabled:opacity-40 ${
                  followed[u.username]
                    ? "bg-gray-100 border-gray-200 text-gray-400"
                    : "bg-blue-500 border-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                {followed[u.username] ? (
                  <><CheckIcon className="w-3 h-3" /> Following</>
                ) : (
                  <><UserPlusIcon className="w-3 h-3" /> Follow</>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {!searching && query.length >= 2 && results.length === 0 && (
        <p className="text-gray-300 text-xs font-mono text-center py-1">No users found</p>
      )}
    </div>
  );
}

function TrendingWidget({ items, onItemClick }: { items: TrendingShow[]; onItemClick: (item: TrendingShow) => void }) {
  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <FireIcon className="w-3.5 h-3.5 text-orange-400" />
        <p className="text-gray-400 text-xs uppercase font-mono tracking-widest">Trending</p>
      </div>
      {items.length === 0 ? (
        <p className="text-gray-300 text-xs font-mono text-center py-2">No trending shows yet</p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item, i) => (
            <div key={`${item.show_name}-${item.detail}`} className="flex items-center gap-3 cursor-pointer group" onClick={() => onItemClick(item)}>
              <span className="text-gray-200 text-xs font-mono w-4 flex-shrink-0">
                {padNum(i + 1)}
              </span>
              {item.thumbnail ? (
                <img
                  src={item.thumbnail}
                  alt={item.show_name}
                  className="w-8 h-12 rounded-md object-cover flex-shrink-0 border border-gray-100"
                />
              ) : (
                <div className="w-8 h-12 rounded-md bg-gray-100 flex-shrink-0 border border-gray-100" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 text-xs font-mono font-semibold truncate group-hover:text-blue-500 transition-colors">
                  {item.show_name}
                </p>
                <p className="text-gray-400 text-xs">{item.detail}</p>
                <span className="text-xs text-gray-500 mt-0.5 inline-block">{item.post_count} posts</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LiveChatsWidget({ chats, onItemClick }: { chats: LiveChat[]; onItemClick: (chat: LiveChat) => void }) {
  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <ChatBubbleLeftRightIcon className="w-3.5 h-3.5 text-blue-400" />
        <p className="text-gray-400 text-xs uppercase font-mono tracking-widest">Live Chats</p>
      </div>
      {chats.length === 0 ? (
        <p className="text-gray-300 text-xs font-mono text-center py-2">No active chats</p>
      ) : (
        <div className="flex flex-col gap-2">
          {chats.map((chat) => (
            <div
              key={`${chat.show_name}-${chat.episode}`}
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100 cursor-pointer hover:border-blue-200 hover:bg-blue-50/40 transition-colors group"
              onClick={() => onItemClick(chat)}
            >
              <div
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  chat.pulse ? "bg-green-400 animate-pulse" : "bg-gray-300"
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 text-xs font-mono font-semibold truncate group-hover:text-blue-600 transition-colors">
                  {chat.show_name}
                </p>
                <p className="text-gray-400 text-xs">{chat.episode}</p>
              </div>
              <span className="text-gray-500 text-xs font-mono flex-shrink-0">{chat.users} users</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


export default function FeedPage() {
  const { username } = useAuth();
  const navigate = useNavigate();

  const handleTrendingClick = async (item: TrendingShow) => {
    try {
      const episode = await retrieveEpisode(item.show_name, item.season, item.episode, item.thumbnail ?? "");
      navigate("/episode", { state: episode });
    } catch {
      // silently ignore
    }
  };

  const handleLiveChatClick = async (chat: LiveChat) => {
    const match = chat.episode.match(/S(\d+)\s*E(\d+)/i);
    if (!match) return;
    const season = parseInt(match[1], 10);
    const episodeNum = parseInt(match[2], 10);
    try {
      const show = await simpleFetchShow(chat.show_name);
      const episode = await retrieveEpisode(chat.show_name, season, episodeNum, show.url);
      navigate("/episode", { state: episode });
    } catch {
      // silently ignore
    }
  };

  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [trending, setTrending] = useState<TrendingShow[]>([]);
  const [liveChats, setLiveChats] = useState<LiveChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [allLoaded, setAllLoaded] = useState(false);

  useEffect(() => {
    Promise.all([fetchTrendingShows(), fetchLiveChats()]).then(([t, l]) => {
      setTrending(t);
      setLiveChats(l);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!username) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchFeedPosts(username, 20, 0)
      .then((data) => {
        setPosts(data);
        if (data.length < 20) setAllLoaded(true);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [username]);

  const handleLoadMore = useCallback(async () => {
    if (!username || loadingMore) return;
    setLoadingMore(true);
    try {
      const more = await fetchFeedPosts(username, 20, posts.length);
      setPosts((prev) => [...prev, ...more]);
      if (more.length < 20) setAllLoaded(true);
    } catch {
      // ignore
    } finally {
      setLoadingMore(false);
    }
  }, [username, posts.length, loadingMore]);

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:grid lg:grid-cols-[1fr_300px] lg:gap-6">

        {/* ── Main feed ── */}
        <div className="flex flex-col gap-4 order-2 lg:order-1">
          <div className="flex items-center justify-between">
            <p className="text-gray-900 font-mono text-sm font-semibold">Following</p>
            <span className="text-gray-400 text-xs font-mono">{posts.length} recent posts</span>
          </div>

          {loading && <Spinner />}

          {!loading && posts.length === 0 && (
            <div className="bg-white border border-dashed border-gray-200 rounded-xl p-8 text-center">
              <p className="text-gray-400 text-sm font-mono">
                {username ? "Follow some users to see their posts here." : "Log in to see your feed."}
              </p>
            </div>
          )}

          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}

          {!loading && posts.length > 0 && (
            !allLoaded ? (
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="w-full py-2.5 rounded-lg border border-dashed border-gray-300 text-gray-400 font-mono text-xs tracking-wider hover:border-blue-400 hover:text-blue-400 transition-colors disabled:opacity-50"
              >
                {loadingMore ? <Spinner /> : "Load More"}
              </button>
            ) : (
              <button
                disabled
                className="w-full py-2 rounded-lg border border-dashed border-gray-200 text-gray-300 font-mono text-xs cursor-default"
              >
                You're all caught up
              </button>
            )
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="flex flex-col gap-4 order-1 lg:order-2 mb-6 lg:mb-0">
          <UserSearchWidget currentUsername={username} />
          <TrendingWidget items={trending} onItemClick={handleTrendingClick} />
          <LiveChatsWidget chats={liveChats} onItemClick={handleLiveChatClick} />
        </div>

      </div>
    </div>
  );
}
