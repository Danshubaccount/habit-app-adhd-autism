# Antigravity App - Supabase Database Structure

This document explains the new relational database structure for your application, designed to work perfectly with Supabase. It takes everything you previously stored in the browser's Local Storage (like habits, mascots, and subtasks) and organizes it into interconnected tables in the cloud.

## Quick Overview

Instead of saving one massive chunk of JSON text under `antigravity_users_v1`, the data is now split into logical "tables" (think of them like separate spreadsheets). This makes your app much faster, easier to search, and allows users to sync their data across multiple devices.

Here are the tables we've created:

### 1. Profiles (`profiles`)
This table stores user information (name, experience points, level).
- **Why it matters:** Whenever a user signs up using Supabase Authentication, a trigger script automatically creates a row for them here. This acts as the "root" for all their other data.

### 2. Mascots (`mascots`)
This table stores the state of the user's Spirit Animal.
- **Why it matters:** It saves the chosen `type` (puppy, kitten, etc.), their `color`, `outfit`, and `accessory`. It also tracks their interaction streak. It's linked directly to the `profiles` table so everyone gets exactly one mascot.

### 3. Categories (`user_categories`)
Stores any custom habit categories the user creates.
- **Why it matters:** If a user makes a category called "Morning Routine", it gets saved here so they can reuse it over and over for different habits.

### 4. Habits (`habits`)
This is the core table where the rules for a habit live.
- **Why it matters:** It stores the `title`, the `cue` (when to do it), the `routine` (what to do), and the `reward`. It also stores configuration settings like if the habit is in "Emergency Mode" (`is_critical`), the desired `scale_level` (mini vs ideal), and the `frequency`.

### 5. Habit Completions (`habit_completions`)
*This is the biggest improvement over Local Storage!*
- **Why it matters:** Instead of saving a giant list of dates inside a habit (e.g., `['2023-01-01', '2023-01-02']`), every single time a user finishes a habit, we simply add a new row here with the date and the habit ID. This makes calculating streaks and weekly progress incredibly fast and reliable.

### 6. Subtasks (`subtasks`)
Stores the mini-steps inside a single habit.
- **Why it matters:** Each row is tied to a specific Habit ID. The row just remembers the text of the subtask and a boolean true/false for whether it was checked off.

### 7. Affirmations (`affirmations`)
Handles both personal affirmations and affirmations tied to specific habits.
- **Why it matters:** If an affirmation is linked to a habit, the `habit_id` column is filled. If it's a global "Personal Affirmation" for the user's bank, the `habit_id` stays empty, but the `user_id` is filled, meaning only that user can see it.

---

## Security (Row Level Security)

If you look at the `schema.sql` file, you'll see a lot of lines mentioning "Row Level Security" or "RLS".

**What does this mean in simple terms?**
Supabase lets apps talk *directly* to the database from the browser. To prevent a malicious user from downloading everyone else's habits, we use RLS. 

Every table has a policy that basically says: *"Before you let someone read or edit this row, check if `auth.uid()` (the ID of the person currently logged in) matches the `user_id` on the row."* 

If it doesn't match, Supabase pretends the row doesn't even exist. It's incredibly secure!

## Next Steps

To apply this to your project:
1. Open your Supabase Dashboard ([https://supabase.com/dashboard/project/qrksvfmtqrgbhkpgrhee](https://supabase.com/dashboard/project/qrksvfmtqrgbhkpgrhee)).
2. Go to the **SQL Editor** on the left menu.
3. Click "New Query".
4. Copy the entire contents of the `supabase/schema.sql` file and paste it into the editor.
5. Hit **Run**. Your entire database structure will instantly be created!
