import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { useUiStore } from '../store/uiStore.js';
import { api } from '../services/api.js';
import { InterestTag as InterestTagType } from '../types/index.js';
import { InterestTag } from '../components/cards/InterestTag.js';
import { DEFAULT_AVATARS } from '../utils/avatars.js';
import { Sparkles, Check, ArrowRight, Shield } from 'lucide-react';

export const ProfileSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, updateProfile, isLoading } = useAuthStore();
  const { showToast } = useUiStore();

  const [availableTags, setAvailableTags] = useState<InterestTagType[]>([]);
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || DEFAULT_AVATARS[0]);
  const [bio, setBio] = useState(profile?.bio || '');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    profile?.interests?.map((i) => i.id) || []
  );

  // Optional real profile info (for mutual consent reveal)
  const [realName, setRealName] = useState(profile?.real_name || '');
  const [realBio, setRealBio] = useState(profile?.real_bio || '');

  useEffect(() => {
    api.get<InterestTagType[]>('/profiles/tags').then(setAvailableTags).catch(console.error);
  }, []);

  const toggleTag = (id: string) => {
    if (selectedTagIds.includes(id)) {
      setSelectedTagIds(selectedTagIds.filter((t) => t !== id));
    } else {
      if (selectedTagIds.length >= 5) {
        showToast('warning', 'You can select a maximum of 5 interests.');
        return;
      }
      setSelectedTagIds([...selectedTagIds, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      showToast('error', 'Please enter a display name');
      return;
    }
    if (selectedTagIds.length < 3) {
      showToast('error', 'Please select at least 3 interests');
      return;
    }

    try {
      await updateProfile({
        display_name: displayName,
        avatar_url: avatarUrl,
        bio,
        interest_ids: selectedTagIds,
        real_name: realName,
        real_bio: realBio,
      });

      showToast('success', 'Profile created successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save profile');
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="p-6 sm:p-10 rounded-3xl bg-[#121824] border border-white/10 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            Step 2 of 2: Create Anonymous Identity
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Personalize Your Orbit Profile
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-400">
            Choose an avatar and tags. Real photos or real names are never required.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Avatar Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              1. Choose Avatar
            </label>
            <div className="flex flex-wrap gap-3 items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/10">
              {DEFAULT_AVATARS.map((url) => (
                <button
                  type="button"
                  key={url}
                  onClick={() => setAvatarUrl(url)}
                  className={`relative p-1 rounded-2xl transition-all duration-200 ${
                    avatarUrl === url
                      ? 'ring-2 ring-indigo-500 scale-110 bg-indigo-500/20'
                      : 'hover:scale-105 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={url}
                    alt="Avatar"
                    className="h-12 w-12 rounded-xl bg-indigo-950/60 p-0.5"
                  />
                  {avatarUrl === url && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-white shadow">
                      <Check className="h-2.5 w-2.5" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Display Alias */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              2. Display Name / Alias
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. CosmicStargazer"
              maxLength={40}
              required
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Interests Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                3. Select Interests (Choose 3–5)
              </label>
              <span className="text-xs font-semibold text-indigo-400">
                {selectedTagIds.length} / 5 selected
              </span>
            </div>
            <div className="flex flex-wrap gap-2 p-4 rounded-2xl bg-white/5 border border-white/10">
              {availableTags.map((tag) => (
                <InterestTag
                  key={tag.id}
                  tag={tag}
                  isSelected={selectedTagIds.includes(tag.id)}
                  onClick={() => toggleTag(tag.id)}
                />
              ))}
            </div>
          </div>

          {/* Short Bio */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              4. Short Bio (Optional)
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="What are you interested in discussing on Orbit?"
              maxLength={200}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Optional Real Identity (Kept Secret until Mutual Consent) */}
          <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
              <Shield className="h-4 w-4 text-indigo-400" />
              <span>Optional Profile Reveal Information (Private)</span>
            </div>
            <p className="text-[11px] text-slate-400">
              This information remains locked and will ONLY ever be shown to users who you explicitly consent to connect with.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={realName}
                onChange={(e) => setRealName(e.target.value)}
                placeholder="Real Name (optional)"
                className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <input
                type="text"
                value={realBio}
                onChange={(e) => setRealBio(e.target.value)}
                placeholder="Real Bio / Links (optional)"
                className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || selectedTagIds.length < 3 || !displayName.trim()}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Enter Orbit'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
