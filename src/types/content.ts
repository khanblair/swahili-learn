export interface Word {
  id: number;
  swahili: string;
  english: string;
  audio_file: string;
  unit_id: number;
  pos: string;
  example_sw: string;
  example_en: string;
}

export interface Phrase {
  id: number;
  swahili: string;
  english: string;
  audio_file: string;
  unit_id: number;
  example_sw: string;
  example_en: string;
}

export interface Sentence {
  id: number;
  swahili: string;
  english: string;
  audio_file: string;
  unit_id: number;
}

export interface Story {
  id: number;
  title: string;
  unit_id: number;
  level: number;
  completed?: number;
  completed_at?: number | null;
}

export interface StoryLine {
  id: number;
  story_id: number;
  line_index: number;
  swahili: string;
  english: string;
  audio_file: string;
}

export type ContentType = 'word' | 'phrase' | 'sentence';

export interface UserCard {
  word_id: number;
  content_type: ContentType;
  interval: number;
  ease_factor: number;
  repetitions: number;
  next_review_ts: number;
  last_reviewed_ts: number;
}

export interface Lesson {
  id: number;
  unit_id: number;
  title: string;
  lesson_index: number;
  exercise_count: number;
}

export interface LessonProgress {
  lesson_id: number;
  completed: boolean;
  perfect: boolean;
  completed_at: number | null;
  xp_earned: number;
}

export interface UserStats {
  id: number;
  total_xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  hearts: number;
  hearts_refill_ts: number;
}

export type ExerciseType = 'translate' | 'listen' | 'match_pairs' | 'multiple_choice';

export interface Exercise {
  type: ExerciseType;
  word: Word;
  options?: string[];
  pairs?: Array<{ left: string; right: string }>;
}
