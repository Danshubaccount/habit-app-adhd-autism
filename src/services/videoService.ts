import { supabase } from '../lib/supabase';
import type {
    Video,
    VideoSequence,
    SequenceItem,
    SequenceWithItems,
    SegmentCategory,
} from '../types/video';

// ──────────────────────────────────────────────
// VIDEOS — CRUD
// ──────────────────────────────────────────────

export async function fetchVideos(segmentFilter?: SegmentCategory): Promise<Video[]> {
    let query = supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

    if (segmentFilter) {
        query = query.eq('segment_category', segmentFilter);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Video[];
}

export async function fetchVideoById(id: string): Promise<Video> {
    const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', id)
        .single();
    if (error) throw error;
    return data as Video;
}

export async function createVideo(
    video: Omit<Video, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<Video> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('videos')
        .insert({ ...video, user_id: user.id })
        .select()
        .single();

    if (error) throw error;
    return data as Video;
}

export async function updateVideo(
    id: string,
    updates: Partial<Omit<Video, 'id' | 'user_id' | 'created_at'>>
): Promise<Video> {
    const { data, error } = await supabase
        .from('videos')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data as Video;
}

export async function deleteVideo(id: string): Promise<void> {
    const { error } = await supabase.from('videos').delete().eq('id', id);
    if (error) throw error;
}

// ──────────────────────────────────────────────
// SEQUENCES — CRUD
// ──────────────────────────────────────────────

export async function fetchSequences(): Promise<VideoSequence[]> {
    const { data, error } = await supabase
        .from('video_sequences')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as VideoSequence[];
}

export async function fetchSequenceWithItems(sequenceId: string): Promise<SequenceWithItems> {
    // 1. Fetch the sequence itself
    const { data: seq, error: seqErr } = await supabase
        .from('video_sequences')
        .select('*')
        .eq('id', sequenceId)
        .single();
    if (seqErr) throw seqErr;

    // 2. Fetch items with embedded video data
    const { data: items, error: itemsErr } = await supabase
        .from('sequence_items')
        .select('*, video:videos(*)')
        .eq('sequence_id', sequenceId)
        .order('sort_order', { ascending: true });
    if (itemsErr) throw itemsErr;

    return { ...seq, items: items ?? [] } as SequenceWithItems;
}

export async function createSequence(
    seq: { title: string; description?: string }
): Promise<VideoSequence> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('video_sequences')
        .insert({ ...seq, user_id: user.id })
        .select()
        .single();

    if (error) throw error;
    return data as VideoSequence;
}

export async function updateSequence(
    id: string,
    updates: { title?: string; description?: string }
): Promise<VideoSequence> {
    const { data, error } = await supabase
        .from('video_sequences')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data as VideoSequence;
}

export async function deleteSequence(id: string): Promise<void> {
    const { error } = await supabase
        .from('video_sequences')
        .delete()
        .eq('id', id);
    if (error) throw error;
}

// ──────────────────────────────────────────────
// SEQUENCE ITEMS — order management
// ──────────────────────────────────────────────

export async function addVideoToSequence(
    sequenceId: string,
    videoId: string,
    sortOrder: number
): Promise<SequenceItem> {
    const { data, error } = await supabase
        .from('sequence_items')
        .insert({ sequence_id: sequenceId, video_id: videoId, sort_order: sortOrder })
        .select()
        .single();

    if (error) throw error;
    return data as SequenceItem;
}

export async function removeVideoFromSequence(itemId: string): Promise<void> {
    const { error } = await supabase
        .from('sequence_items')
        .delete()
        .eq('id', itemId);
    if (error) throw error;
}

/** Re-order all items in a sequence after a drag-drop or insertion */
export async function reorderSequenceItems(
    sequenceId: string,
    orderedItemIds: string[]
): Promise<void> {
    // Update each item's sort_order in parallel
    const promises = orderedItemIds.map((id, index) =>
        supabase
            .from('sequence_items')
            .update({ sort_order: index })
            .eq('id', id)
            .eq('sequence_id', sequenceId)
    );

    const results = await Promise.all(promises);
    const firstError = results.find((r) => r.error);
    if (firstError?.error) throw firstError.error;
}

/**
 * Validate that a sequence has exactly one beginning and one end video.
 * Returns an object with validation state.
 */
export function validateSequence(
    items: { video: Video }[]
): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const beginnings = items.filter((i) => i.video.segment_category === 'beginning');
    const ends = items.filter((i) => i.video.segment_category === 'end');

    if (beginnings.length === 0) errors.push('Sequence must start with a Beginning video.');
    if (beginnings.length > 1) errors.push('Sequence should only have one Beginning video.');
    if (ends.length === 0) errors.push('Sequence must end with an End video.');
    if (ends.length > 1) errors.push('Sequence should only have one End video.');

    if (items.length > 0) {
        if (items[0].video.segment_category !== 'beginning') {
            errors.push('The first video must be a Beginning video.');
        }
        if (items[items.length - 1].video.segment_category !== 'end') {
            errors.push('The last video must be an End video.');
        }
    }

    return { valid: errors.length === 0, errors };
}
