// ---- Segment Categories ----
export type SegmentCategory = 'beginning' | 'middle' | 'end';

export const SEGMENT_LABELS: Record<SegmentCategory, string> = {
    beginning: '🟢 Beginning',
    middle: '🔵 Middle',
    end: '🔴 End',
};

export const SEGMENT_COLORS: Record<SegmentCategory, string> = {
    beginning: '#22c55e',
    middle: '#3b82f6',
    end: '#ef4444',
};

// ---- Core Types ----
export interface Video {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    url: string;
    thumbnail_url: string | null;
    segment_category: SegmentCategory;
    duration_seconds: number | null;
    tags: string[];
    created_at: string;
    updated_at: string;
}

export interface VideoSequence {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    created_at: string;
    updated_at: string;
}

export interface SequenceItem {
    id: string;
    sequence_id: string;
    video_id: string;
    sort_order: number;
    created_at: string;
}

// ---- Composite Types ----
export interface SequenceItemWithVideo extends SequenceItem {
    video: Video;
}

export interface SequenceWithItems extends VideoSequence {
    items: SequenceItemWithVideo[];
}

// ---- Form Types ----
export interface VideoFormData {
    title: string;
    description: string;
    url: string;
    thumbnail_url: string;
    segment_category: SegmentCategory;
    duration_seconds: string;
    tags: string;
}

export interface SequenceFormData {
    title: string;
    description: string;
}
