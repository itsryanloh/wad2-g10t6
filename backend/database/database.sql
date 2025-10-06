-- CAT ADOPTION PLATFORM - DATABASE SCHEMA
-- =======================================
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  contact_no VARCHAR(20),
  age INTEGER,
  gender VARCHAR(20),
  role VARCHAR(50) DEFAULT 'user',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  post_type VARCHAR(50) NOT NULL CHECK (post_type IN ('adoption', 'sighting', 'lost', 'found', 'discussion', 'update')),
  location_name VARCHAR(255),
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  image_urls TEXT[],
  tags TEXT[],
  view_count INTEGER DEFAULT 0,
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE post_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reaction_type VARCHAR(20) DEFAULT 'like' CHECK (reaction_type IN ('like', 'heart', 'helpful')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id, reaction_type)
);

-- CREATE INDEXES
-- ==============

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_post_type ON posts(post_type);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_post_reactions_post_id ON post_reactions(post_id);
CREATE INDEX idx_post_reactions_user_id ON post_reactions(user_id);


-- ROW LEVEL SECURITY
-- ==================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can create profile" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE 
  USING (id = (current_setting('request.jwt.claims', true)::json->>'user_id')::uuid);
CREATE POLICY "Users can delete own profile" ON users FOR DELETE 
  USING (id = (current_setting('request.jwt.claims', true)::json->>'user_id')::uuid);

CREATE POLICY "Anyone can view posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts" ON posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE 
  USING (user_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::uuid);
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE 
  USING (user_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::uuid);

CREATE POLICY "Anyone can view comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE 
  USING (user_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::uuid);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE 
  USING (user_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::uuid);

CREATE POLICY "Anyone can view reactions" ON post_reactions FOR SELECT USING (true);
CREATE POLICY "Users can add reactions" ON post_reactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can remove own reactions" ON post_reactions FOR DELETE 
  USING (user_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::uuid);


-- AUTO-UPDATE TRIGGERS
-- ====================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION increment_post_views(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts SET view_count = view_count + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- TEST DATA
-- =========

INSERT INTO users (name, username, password, contact_no, age, gender, avatar_url) VALUES
('John Tan', 'johntan', '00000000', '+65 9123 4567', 28, 'male', 'https://i.pravatar.cc/150?img=12'),
('Amy Lim', 'amylim', '00000000', '+65 8234 5678', 25, 'female', 'https://i.pravatar.cc/150?img=5'),
('David Chen', 'davidchen', '00000000', '+65 9345 6789', 32, 'male', 'https://i.pravatar.cc/150?img=33'),
('Sarah Wong', 'sarahwong', '00000000', '+65 8456 7890', 29, 'female', 'https://i.pravatar.cc/150?img=9');

INSERT INTO posts (user_id, title, content, post_type, location_name, location_lat, location_lng, tags) VALUES
(
  (SELECT id FROM users WHERE username = 'johntan'),
  'Friendly Orange Tabby Looking for Home',
  'Found this sweet orange tabby near Block 123 Ang Mo Kio Ave 3. Very friendly and loves cuddles! The cat appears to be around 1-2 years old, well-groomed, and seems to be familiar with humans. Looking for a loving home or the original owner.',
  'adoption',
  'Block 123 Ang Mo Kio Ave 3',
  1.36915894,
  103.84510803,
  ARRAY['tabby', 'friendly', 'orange', 'young']
),
(
  (SELECT id FROM users WHERE username = 'amylim'),
  'Lost: Black Cat with White Paws',
  'URGENT! My cat Oreo went missing on 3rd Oct near Bishan Park. He is a black cat with distinctive white paws and a small white patch on his chest. Very shy with strangers. Please contact me if you have seen him!',
  'lost',
  'Bishan Park',
  1.35208,
  103.84553,
  ARRAY['black', 'white paws', 'shy', 'missing']
),
(
  (SELECT id FROM users WHERE username = 'davidchen'),
  'Community Cat Spotted - Needs Medical Attention',
  'Noticed a community cat near Toa Payoh Block 85 with a slight limp. The cat seems friendly but appears to be in pain. Can any rescuers help? I feed her regularly but I think she needs to see a vet.',
  'sighting',
  'Toa Payoh Block 85',
  1.33429,
  103.85703,
  ARRAY['injured', 'needs help', 'community cat', 'toa payoh']
),
(
  (SELECT id FROM users WHERE username = 'sarahwong'),
  'Found: Grey Tabby Near Clementi MRT',
  'Found a grey tabby cat near Clementi MRT Station this morning. The cat has a blue collar but no tag. Very friendly and well-fed, definitely belongs to someone. Currently keeping her safe at home. Please contact if this is your cat!',
  'found',
  'Clementi MRT Station',
  1.31509,
  103.76534,
  ARRAY['grey', 'tabby', 'collar', 'found']
),
(
  (SELECT id FROM users WHERE username = 'johntan'),
  'Tips for First-Time Cat Adopters',
  'Hey everyone! Just wanted to share some tips for those considering adopting a cat for the first time:\n\n1. Prepare your home - remove toxic plants, secure windows\n2. Get essential supplies - litter box, food bowls, scratching post\n3. Schedule a vet visit within the first week\n4. Be patient - cats need time to adjust\n\nFeel free to ask questions!',
  'discussion',
  NULL,
  NULL,
  NULL,
  ARRAY['tips', 'adoption', 'first time', 'advice']
);

INSERT INTO comments (post_id, user_id, content) VALUES
(
  (SELECT id FROM posts WHERE title = 'Friendly Orange Tabby Looking for Home'),
  (SELECT id FROM users WHERE username = 'amylim'),
  'This cat is adorable! Is it still available for adoption? I have experience with cats and would love to give it a home.'
),
(
  (SELECT id FROM posts WHERE title = 'Friendly Orange Tabby Looking for Home'),
  (SELECT id FROM users WHERE username = 'johntan'),
  'Yes, still available! The cat is very gentle and would be perfect for a family. DM me if you are interested!'
),
(
  (SELECT id FROM posts WHERE title = 'Lost: Black Cat with White Paws'),
  (SELECT id FROM users WHERE username = 'davidchen'),
  'I will keep an eye out in my area. Have you posted on the Lost and Found Cats Singapore Facebook group?'
),
(
  (SELECT id FROM posts WHERE title = 'Found: Grey Tabby Near Clementi MRT'),
  (SELECT id FROM users WHERE username = 'sarahwong'),
  'Update: The owner has been found! She lives nearby and was very grateful. Oreo is back home safely! 😊'
),
(
  (SELECT id FROM posts WHERE title = 'Tips for First-Time Cat Adopters'),
  (SELECT id FROM users WHERE username = 'amylim'),
  'Great tips! I would also add - get pet insurance early. Vet bills can be expensive and it is better to be prepared.'
);

INSERT INTO post_reactions (post_id, user_id, reaction_type) VALUES
(
  (SELECT id FROM posts WHERE title = 'Friendly Orange Tabby Looking for Home'),
  (SELECT id FROM users WHERE username = 'amylim'),
  'heart'
),
(
  (SELECT id FROM posts WHERE title = 'Friendly Orange Tabby Looking for Home'),
  (SELECT id FROM users WHERE username = 'davidchen'),
  'like'
),
(
  (SELECT id FROM posts WHERE title = 'Lost: Black Cat with White Paws'),
  (SELECT id FROM users WHERE username = 'johntan'),
  'heart'
),
(
  (SELECT id FROM posts WHERE title = 'Found: Grey Tabby Near Clementi MRT'),
  (SELECT id FROM users WHERE username = 'amylim'),
  'helpful'
),
(
  (SELECT id FROM posts WHERE title = 'Tips for First-Time Cat Adopters'),
  (SELECT id FROM users WHERE username = 'sarahwong'),
  'helpful'
),
(
  (SELECT id FROM posts WHERE title = 'Tips for First-Time Cat Adopters'),
  (SELECT id FROM users WHERE username = 'davidchen'),
  'like'
);