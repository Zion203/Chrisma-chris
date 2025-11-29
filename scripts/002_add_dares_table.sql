-- Dares table to store dare messages between Secret Santa participants
CREATE TABLE IF NOT EXISTS dares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  dare_text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_dares_room_id ON dares(room_id);
CREATE INDEX IF NOT EXISTS idx_dares_sender_id ON dares(sender_id);
CREATE INDEX IF NOT EXISTS idx_dares_receiver_id ON dares(receiver_id);
CREATE INDEX IF NOT EXISTS idx_dares_is_read ON dares(is_read);
