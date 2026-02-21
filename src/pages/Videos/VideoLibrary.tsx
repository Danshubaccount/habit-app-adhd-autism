import React, { useState, useEffect, useCallback } from 'react';
import {
    Film, Plus, X, Trash2, Edit3, Tag, Clock,
    CheckCircle, Filter, Search,
} from 'lucide-react';
import type { Video, SegmentCategory, VideoFormData } from '../../types/video';
import { SEGMENT_LABELS, SEGMENT_COLORS } from '../../types/video';
import {
    fetchVideos,
    createVideo,
    updateVideo,
    deleteVideo,
} from '../../services/videoService';
import './VideoLibrary.css';

const EMPTY_FORM: VideoFormData = {
    title: '',
    description: '',
    url: '',
    thumbnail_url: '',
    segment_category: 'middle',
    duration_seconds: '',
    tags: '',
};

interface Props {
    onBack: () => void;
    onOpenSequences: () => void;
}

const VideoLibrary: React.FC<Props> = ({ onBack, onOpenSequences }) => {
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<SegmentCategory | 'all'>('all');
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<VideoFormData>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewVideo, setPreviewVideo] = useState<Video | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchVideos(filter === 'all' ? undefined : filter);
            setVideos(data);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => { load(); }, [load]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        const payload = {
            title: form.title.trim(),
            description: form.description.trim() || null,
            url: form.url.trim(),
            thumbnail_url: form.thumbnail_url.trim() || null,
            segment_category: form.segment_category as SegmentCategory,
            duration_seconds: form.duration_seconds ? parseInt(form.duration_seconds, 10) : null,
            tags: form.tags
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean),
        };

        try {
            if (editingId) {
                await updateVideo(editingId, payload);
            } else {
                await createVideo(payload);
            }
            setForm(EMPTY_FORM);
            setEditingId(null);
            setShowForm(false);
            await load();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (video: Video) => {
        setForm({
            title: video.title,
            description: video.description ?? '',
            url: video.url,
            thumbnail_url: video.thumbnail_url ?? '',
            segment_category: video.segment_category,
            duration_seconds: video.duration_seconds?.toString() ?? '',
            tags: video.tags.join(', '),
        });
        setEditingId(video.id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this video? It will be removed from all sequences.')) return;
        try {
            await deleteVideo(id);
            await load();
        } catch (e: any) {
            setError(e.message);
        }
    };

    const filtered = videos.filter((v) =>
        v.title.toLowerCase().includes(search.toLowerCase()) ||
        v.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    );

    const formatDuration = (seconds: number | null) => {
        if (!seconds) return '—';
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="video-library-page">
            {/* ── Header ── */}
            <header className="vl-header">
                <button className="vl-back-btn" onClick={onBack}>← Back</button>
                <div className="vl-header-text">
                    <h1><Film size={28} /> Video Library</h1>
                    <p className="vl-subtitle">Manage your video clips by segment category</p>
                </div>
                <div className="vl-header-actions">
                    <button className="vl-btn vl-btn-secondary" onClick={onOpenSequences}>
                        Sequences →
                    </button>
                    <button
                        className="vl-btn vl-btn-primary"
                        onClick={() => {
                            setForm(EMPTY_FORM);
                            setEditingId(null);
                            setShowForm(true);
                        }}
                    >
                        <Plus size={18} /> Add Video
                    </button>
                </div>
            </header>

            {/* ── Toolbar ── */}
            <div className="vl-toolbar">
                <div className="vl-search-box">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Search videos…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="vl-filter-chips">
                    <Filter size={16} />
                    {(['all', 'beginning', 'middle', 'end'] as const).map((cat) => (
                        <button
                            key={cat}
                            className={`vl-chip ${filter === cat ? 'active' : ''}`}
                            style={
                                cat !== 'all' && filter === cat
                                    ? { borderColor: SEGMENT_COLORS[cat], color: SEGMENT_COLORS[cat] }
                                    : {}
                            }
                            onClick={() => setFilter(cat)}
                        >
                            {cat === 'all' ? '🎬 All' : SEGMENT_LABELS[cat]}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Stats ── */}
            <div className="vl-stats-row">
                {(['beginning', 'middle', 'end'] as SegmentCategory[]).map((cat) => {
                    const count = videos.filter((v) => v.segment_category === cat).length;
                    return (
                        <div
                            key={cat}
                            className="vl-stat-card"
                            style={{ borderColor: SEGMENT_COLORS[cat] }}
                        >
                            <span className="vl-stat-count">{count}</span>
                            <span className="vl-stat-label">{SEGMENT_LABELS[cat]}</span>
                        </div>
                    );
                })}
                <div className="vl-stat-card" style={{ borderColor: '#a855f7' }}>
                    <span className="vl-stat-count">{videos.length}</span>
                    <span className="vl-stat-label">📦 Total</span>
                </div>
            </div>

            {error && (
                <div className="vl-error">
                    <span>{error}</span>
                    <button onClick={() => setError(null)}><X size={14} /></button>
                </div>
            )}

            {/* ── Video Grid ── */}
            {loading ? (
                <div className="vl-loading">
                    <div className="vl-spinner" />
                    <p>Loading videos…</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="vl-empty">
                    <Film size={48} />
                    <p>No videos yet — add your first clip!</p>
                </div>
            ) : (
                <div className="vl-grid">
                    {filtered.map((video) => (
                        <div
                            key={video.id}
                            className="vl-card"
                            style={{
                                '--segment-color': SEGMENT_COLORS[video.segment_category],
                            } as React.CSSProperties}
                        >
                            <div
                                className="vl-card-thumb"
                                onClick={() => setPreviewVideo(video)}
                            >
                                {video.thumbnail_url ? (
                                    <img src={video.thumbnail_url} alt={video.title} />
                                ) : (
                                    <div className="vl-card-thumb-placeholder">
                                        <Film size={32} />
                                    </div>
                                )}
                                <span
                                    className="vl-card-badge"
                                    style={{ background: SEGMENT_COLORS[video.segment_category] }}
                                >
                                    {video.segment_category}
                                </span>
                            </div>

                            <div className="vl-card-body">
                                <h3>{video.title}</h3>
                                {video.description && (
                                    <p className="vl-card-desc">{video.description}</p>
                                )}
                                <div className="vl-card-meta">
                                    {video.duration_seconds != null && (
                                        <span><Clock size={12} /> {formatDuration(video.duration_seconds)}</span>
                                    )}
                                    {video.tags.length > 0 && (
                                        <span><Tag size={12} /> {video.tags.join(', ')}</span>
                                    )}
                                </div>
                            </div>

                            <div className="vl-card-actions">
                                <button onClick={() => handleEdit(video)} title="Edit">
                                    <Edit3 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(video.id)}
                                    title="Delete"
                                    className="vl-danger"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Add / Edit Modal ── */}
            {showForm && (
                <div className="vl-modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="vl-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="vl-modal-header">
                            <h2>{editingId ? 'Edit Video' : 'Add New Video'}</h2>
                            <button onClick={() => setShowForm(false)}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="vl-form">
                            <label>
                                <span>Title *</span>
                                <input
                                    type="text"
                                    required
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    placeholder="e.g. Calm Intro"
                                />
                            </label>

                            <label>
                                <span>Video URL *</span>
                                <input
                                    type="url"
                                    required
                                    value={form.url}
                                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                                    placeholder="https://…"
                                />
                            </label>

                            <label>
                                <span>Segment Category *</span>
                                <div className="vl-segment-picker">
                                    {(['beginning', 'middle', 'end'] as SegmentCategory[]).map((cat) => (
                                        <button
                                            key={cat}
                                            type="button"
                                            className={`vl-seg-btn ${form.segment_category === cat ? 'active' : ''}`}
                                            style={
                                                form.segment_category === cat
                                                    ? { background: SEGMENT_COLORS[cat], borderColor: SEGMENT_COLORS[cat] }
                                                    : { borderColor: SEGMENT_COLORS[cat], color: SEGMENT_COLORS[cat] }
                                            }
                                            onClick={() => setForm({ ...form, segment_category: cat })}
                                        >
                                            {SEGMENT_LABELS[cat]}
                                        </button>
                                    ))}
                                </div>
                            </label>

                            <label>
                                <span>Description</span>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Short description…"
                                    rows={3}
                                />
                            </label>

                            <div className="vl-form-row">
                                <label>
                                    <span>Thumbnail URL</span>
                                    <input
                                        type="url"
                                        value={form.thumbnail_url}
                                        onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
                                        placeholder="https://…"
                                    />
                                </label>
                                <label>
                                    <span>Duration (seconds)</span>
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.duration_seconds}
                                        onChange={(e) => setForm({ ...form, duration_seconds: e.target.value })}
                                        placeholder="120"
                                    />
                                </label>
                            </div>

                            <label>
                                <span>Tags (comma-separated)</span>
                                <input
                                    type="text"
                                    value={form.tags}
                                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                                    placeholder="meditation, calm, intro"
                                />
                            </label>

                            <button
                                type="submit"
                                className="vl-btn vl-btn-primary vl-btn-full"
                                disabled={saving}
                            >
                                {saving ? 'Saving…' : editingId ? (
                                    <><CheckCircle size={16} /> Save Changes</>
                                ) : (
                                    <><Plus size={16} /> Add Video</>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Preview Modal ── */}
            {previewVideo && (
                <div className="vl-modal-overlay" onClick={() => setPreviewVideo(null)}>
                    <div className="vl-preview-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="vl-preview-close" onClick={() => setPreviewVideo(null)}>
                            <X size={24} />
                        </button>
                        <video
                            src={previewVideo.url}
                            controls
                            autoPlay
                            className="vl-preview-player"
                        />
                        <h3>{previewVideo.title}</h3>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoLibrary;
