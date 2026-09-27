"use client";

export default function PlaylistPanel() {

  return (
    <aside className="bg-red-950/90 border border-red-500 rounded-xl p-6 h-fit sticky top-28">

      <h3 className="text-xl font-bold mb-4">
        Your Playlist
      </h3>

      <div className="space-y-3">

        <button className="ui-btn w-full">
          Save Beat
        </button>

        <button className="ui-btn w-full">
          Add to Playlist
        </button>

        <button className="ui-btn w-full">
          Create Playlist
        </button>

        <div className="text-white/60 text-sm pt-4 border-t border-red-700">
          Login to manage playlists
        </div>

      </div>

    </aside>
  );
}