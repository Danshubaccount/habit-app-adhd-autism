-- Create a table for User Profiles
-- We link this to Supabase's built-in authentication system (auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  age INTEGER,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Note: We use Row Level Security (RLS) to ensure users can only see and edit their own data.
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Create a table for the user's Spirit Animal / Mascot
CREATE TABLE mascots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE, -- 1 mascot per user
  type TEXT NOT NULL, -- 'puppy', 'kitten', 'bird', 'fox', 'bunny'
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  outfit TEXT NOT NULL,
  accessory TEXT,
  last_interaction_at TIMESTAMP WITH TIME ZONE,
  streak INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE mascots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their mascot" ON mascots FOR ALL USING (auth.uid() = user_id);

-- Create a table for user-defined Habit Categories
CREATE TABLE user_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, name) -- Prevent duplicate category names for the same user
);

ALTER TABLE user_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their categories" ON user_categories FOR ALL USING (auth.uid() = user_id);

-- Create the main Habits table
CREATE TABLE habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  cue TEXT,
  routine TEXT,
  reward TEXT,
  category TEXT, -- Or could reference user_categories(id)
  streak INTEGER DEFAULT 0,
  is_critical BOOLEAN DEFAULT FALSE,
  frequency INTEGER DEFAULT 7,
  period TEXT DEFAULT 'week',
  grace_days INTEGER DEFAULT 0,
  scale_level TEXT DEFAULT 'standard', -- 'mini', 'standard', 'ideal'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their habits" ON habits FOR ALL USING (auth.uid() = user_id);

-- Create a table specifically for tracking which days a habit was completed
-- This replaces the array of dates in the local storage, making it much easier to query!
CREATE TABLE habit_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  completed_date DATE NOT NULL, -- E.g. '2023-10-27'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(habit_id, completed_date) -- Ensure a habit can only be completed once per day
);

-- We need to check auth.uid() against the user_id on the habits table for RLS
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their habit completions" ON habit_completions FOR ALL
  USING (EXISTS (SELECT 1 FROM habits WHERE habits.id = habit_completions.habit_id AND habits.user_id = auth.uid()));

-- Create a table for Habit Subtasks
CREATE TABLE subtasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their subtasks" ON subtasks FOR ALL
  USING (EXISTS (SELECT 1 FROM habits WHERE habits.id = subtasks.habit_id AND habits.user_id = auth.uid()));

-- Create a table for Affirmations
-- This handles BOTH personal affirmations and habit-specific affirmations
CREATE TABLE affirmations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE, -- Nullable! If null, it's a personal affirmation
  text TEXT NOT NULL,
  repeats INTEGER DEFAULT 1,
  is_personal BOOLEAN DEFAULT FALSE,
  theme TEXT,
  trigger_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE affirmations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their affirmations" ON affirmations FOR ALL USING (auth.uid() = user_id);

-- ---
-- AUTOMATION (Triggers)
-- ---

-- Automatically create a profile when a new user signs up in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
