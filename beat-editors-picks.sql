-- Adds a saved admin selection for future recommendations and playlists.
-- Existing beats start unstarred. This does not alter BPM, order or availability.
ALTER TABLE public."Beat" ADD COLUMN IF NOT EXISTS "isEditorsPick" BOOLEAN NOT NULL DEFAULT false;
