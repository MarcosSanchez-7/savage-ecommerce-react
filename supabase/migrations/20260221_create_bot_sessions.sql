-- ============================================================
-- SAVAGE CHATBOT: bot_sessions table
-- Tracks WhatsApp user state for the chatbot flow
-- ============================================================

CREATE TABLE IF NOT EXISTS public.bot_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    phone_number TEXT NOT NULL UNIQUE,
    state TEXT NOT NULL DEFAULT 'welcome',
    -- 'welcome' | 'category_browse' | 'human'
    current_category_id TEXT,
    -- ID of the category the user is currently browsing (nullable)
    last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast phone lookups (webhook receives phone number)
CREATE INDEX IF NOT EXISTS idx_bot_sessions_phone ON public.bot_sessions (phone_number);

-- Index for session cleanup (find old sessions)
CREATE INDEX IF NOT EXISTS idx_bot_sessions_last_message ON public.bot_sessions (last_message_at);

-- Auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_bot_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_bot_sessions_updated_at
    BEFORE UPDATE ON public.bot_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_bot_session_timestamp();

-- RLS: Only service_role can access (Edge Functions use service key)
ALTER TABLE public.bot_sessions ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access
CREATE POLICY "Service role full access on bot_sessions" ON public.bot_sessions FOR ALL USING (true)
WITH
    CHECK (true);

-- Comment for documentation
COMMENT ON
TABLE public.bot_sessions IS 'Tracks chatbot conversation state per WhatsApp user';

COMMENT ON COLUMN public.bot_sessions.state IS 'Current state: welcome, category_browse, human';

COMMENT ON COLUMN public.bot_sessions.current_category_id IS 'The category ID the user is browsing, if applicable';