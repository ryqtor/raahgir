-- Migration: Add notifications system and helpful count RPC
-- 1. Create Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL, -- 'answer', 'verification', 'system', 'helpful'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications (mark as read)"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- 2. Create RPC for incrementing helpful count
CREATE OR REPLACE FUNCTION public.increment_helpful_count(answer_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.answers
    SET helpful_count = helpful_count + 1
    WHERE id = answer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Triggers for auto-notifications
-- Trigger on New Answer
CREATE OR REPLACE FUNCTION public.on_new_answer_notify()
RETURNS TRIGGER AS $$
DECLARE
    v_traveler_id UUID;
    v_query_text TEXT;
BEGIN
    -- Get query info
    SELECT traveler_id, question INTO v_traveler_id, v_query_text
    FROM public.queries
    WHERE id = NEW.query_id;

    -- Create notification
    INSERT INTO public.notifications (user_id, type, title, message, link)
    VALUES (
        v_traveler_id,
        'answer',
        'New Local Response',
        'A local has responded to your question: "' || LEFT(v_query_text, 30) || '..."',
        '/dashboard'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_on_answer
    AFTER INSERT ON public.answers
    FOR EACH ROW
    EXECUTE FUNCTION public.on_new_answer_notify();
