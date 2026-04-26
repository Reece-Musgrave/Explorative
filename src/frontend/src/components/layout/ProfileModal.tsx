import { useState, useEffect } from "react";
import { X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../context/authContext";
import {fetchFollowedShows, fetchFollowedUsers, deleteFollowUserRelationship, deleteFollowShowRelationship, fetchUser } from "@/api/social/socialNetwork";
import { simpleFetchShow } from "@/api/shows/shows";
import { ApiError } from "@/lib/apiClient";

interface ProfileModalProps {
  onClose: () => void;
}

export default function ProfileModal({ onClose }: ProfileModalProps) {
  const { logout, username } = useAuth();

  const [userID, setUserID] = useState<number | null>(null);
  const [followedShows, setFollowedShows] = useState<string[]>([]);
  const [followedUsers, setFollowedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;

    const loadProfileData = async () => {
      try {
        setLoading(true);
        setError(null);
    
        const userResponse = await fetchUser(username);
        setUserID(userResponse.id);
    
        const [shows, users] = await Promise.all([
          fetchFollowedShows(userResponse.id).catch((err) => {
            if (err instanceof ApiError && err.status === 404) return [];
            throw err;
          }),
          fetchFollowedUsers(userResponse.id).catch((err) => {
            if (err instanceof ApiError && err.status === 404) return [];
            throw err;
          }),
        ]);
    
        setFollowedShows(shows);
        setFollowedUsers(users);
      } catch (err) {
        setError("Failed to load profile data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [username]);

  const handleUnfollowUser = async (targetUsername: string) => {
    if (userID === null) return;
    try {
      const targetUser = await fetchUser(targetUsername);
      await deleteFollowUserRelationship(userID, targetUser.id);
      setFollowedUsers((prev) => prev.filter((u) => u !== targetUsername));
    } catch (err) {
      console.error(`Failed to unfollow user ${targetUsername}:`, err);
    }
  };

  const handleUnfollowShow = async (showName: string) => {
    if (userID === null) return;
    try {
      const show = await simpleFetchShow(showName);
      await deleteFollowShowRelationship(userID, show.id);
      setFollowedShows((prev) => prev.filter((s) => s !== showName));
    } catch (err) {
      console.error(`Failed to unfollow show ${showName}:`, err);
    }
  };

  const handleLogout = async () => {
    await fetch(`/api/v1/users/logout`, {
      method: "POST",
      credentials: "include",
    });
    logout();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
          aria-label="Close profile"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <p className="font-mono text-[9px] tracking-[3px] text-gray-400 mb-1">
            YOUR PROFILE
          </p>
          <p className="text-xl font-bold text-gray-900">@{username!}</p>
        </div>

        <div className="px-6 py-4 space-y-5 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-4">Loading...</p>
          ) : error ? (
            <p className="text-sm text-red-400 text-center py-4">{error}</p>
          ) : (
            <>
              <div className="space-y-2">
                <p className="font-mono text-[9px] tracking-[3px] text-gray-400">
                  ACCOUNT
                </p>
                <button
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-sm font-medium text-gray-700 transition-colors"
                  onClick={() => {
                    /* TODO: open change-password flow */
                  }}
                >
                  Change Password
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-sm font-medium text-gray-700 transition-colors"
                  onClick={() => {
                    /* TODO: open change-email flow */
                  }}
                >
                  Change Email
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <div className="space-y-2">
                <p className="font-mono text-[9px] tracking-[3px] text-gray-400">
                  FOLLOWED USERS
                </p>
                {followedUsers.length === 0 ? (
                  <p className="text-sm text-gray-400 px-1">
                    Not following anyone yet.
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {followedUsers.map((user) => (
                      <li
                        key={user}
                        className="flex items-center justify-between px-4 py-2 rounded-lg border border-gray-100 bg-gray-50 text-sm text-gray-700"
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500 uppercase flex-shrink-0">
                            {user[0]}
                          </span>
                          @{user}
                        </span>
                        <button
                          onClick={() => handleUnfollowUser(user)}
                          className="text-xs font-mono text-red-400 hover:text-red-600 transition-colors tracking-wide"
                        >
                          UNFOLLOW
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="space-y-2">
                <p className="font-mono text-[9px] tracking-[3px] text-gray-400">
                  FOLLOWED SHOWS
                </p>
                {followedShows.length === 0 ? (
                  <p className="text-sm text-gray-400 px-1">
                    No shows followed yet.
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {followedShows.map((show) => (
                      <li
                        key={show}
                        className="flex items-center justify-between px-4 py-2 rounded-lg border border-gray-100 bg-gray-50 text-sm text-gray-700"
                      >
                        <span>{show}</span>
                        <button
                          onClick={() => handleUnfollowShow(show)}
                          className="text-xs font-mono text-red-400 hover:text-red-600 transition-colors tracking-wide"
                        >
                          UNFOLLOW
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100">
          <Button
            onClick={handleLogout}
            className="w-full bg-gray-900 hover:bg-gray-700 text-white font-mono text-xs tracking-widest py-5 rounded-lg border-none"
          >
            SIGN OUT
          </Button>
        </div>
      </div>
    </div>
  );
}