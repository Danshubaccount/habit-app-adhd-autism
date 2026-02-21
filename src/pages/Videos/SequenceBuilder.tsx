import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Layers, Plus, X, Trash2, Play, AlertTriangle,
    GripVertical, CheckCircle, ChevronDown,
    ChevronUp, Edit3,
} from 'lucide-react';
import type {
    Video,
    VideoSequence,
    SequenceWithItems,
    SegmentCategory,
    SequenceFormData,
} from '../../types/video';
import { SEGMENT_LABELS, SEGMENT_COLORS } from '../../types/video';
import {
    fetchVideos,
    fetchSequences,
    fetchSequenceWithItems,
    createSequence,
    updateSequence,
    deleteSequence,
    addVideoToSequence,
    removeVideoFromSequence,
    reorderSequenceItems,
    validateSequence,
} from '../../services/videoService';
import './SequenceBuilder.css';

interface Props {
    onBack: () => void;
    onOpenLibrary: () => void;
}

const SequenceBuilder: React.FC<Props> = ({ onBack, onOpenLibrary }) => {
    // ── State ──
    const [sequences, setSequences] = useState<VideoSequence[]>([]);
    const [activeSeq, setActiveSeq] = useState<SequenceWithItems | null>(null);
    const [allVideos, setAllVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showNewForm, setShowNewForm] = useState(false);
    const [newForm, setNewForm] = useState<SequenceFormData>({ title: '', description: '' });
    const [editingSeq, setEditingSeq] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<SequenceFormData>({ title: '', description: '' });
    const [saving, setSaving] = useState(false);
    const [showAddPicker, setShowAddPicker] = useState(false);
    const [pickerFilter, setPickerFilter] = useState<SegmentCategory | 'all'>('all');
    const [playingSequence, setPlayingSequence] = useState(false);
    const [playingIndex, setPlayingIndex] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Drag state
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const loadSequences = useCallback(async () => {
        setLoading(true);
        try {
            const [seqs, vids] = await Promise.all([
                fetchSequences(),
                fetchVideos(),
            ]);
            setSequences(seqs);
            setAllVideos(vids);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadSequences(); }, [loadSequences]);

    const selectSequence = async (id: string) => {
        try {
            const full = await fetchSequenceWithItems(id);
            setActiveSeq(full);
        } catch (e: any) {
            setError(e.message);
        }
    };

    // ── CRUD handlers ──
    const handleCreateSequence = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const created = await createSequence({
                title: newForm.title.trim(),
                description: newForm.description.trim() || undefined,
            });
            setNewForm({ title: '', description: '' });
            setShowNewForm(false);
            await loadSequences();
            await selectSequence(created.id);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateSequence = async (id: string) => {
        setSaving(true);
        try {
            await updateSequence(id, {
                title: editForm.title.trim(),
                description: editForm.description.trim() || undefined,
            });
            setEditingSeq(null);
            await loadSequences();
            if (activeSeq?.id === id) await selectSequence(id);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteSequence = async (id: string) => {
        if (!confirm('Delete this sequence?')) return;
        try {
            await deleteSequence(id);
            if (activeSeq?.id === id) setActiveSeq(null);
            await loadSequences();
        } catch (e: any) {
            setError(e.message);
        }
    };

    // ── Item management ──
    const handleAddVideo = async (video: Video) => {
        if (!activeSeq) return;
        setSaving(true);
        try {
            const nextOrder = activeSeq.items.length;
            await addVideoToSequence(activeSeq.id, video.id, nextOrder);
            await selectSequence(activeSeq.id);
            setShowAddPicker(false);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveItem = async (itemId: string) => {
        if (!activeSeq) return;
        try {
            await removeVideoFromSequence(itemId);
            await selectSequence(activeSeq.id);
        } catch (e: any) {
            setError(e.message);
        }
    };

    // ── Drag & Drop reorder ──
    const handleDragStart = (index: number) => {
        setDragIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        setDragOverIndex(index);
    };

    const handleDrop = async (dropIndex: number) => {
        if (dragIndex === null || !activeSeq) return;
        if (dragIndex === dropIndex) {
            setDragIndex(null);
            setDragOverIndex(null);
            return;
        }

        const items = [...activeSeq.items];
        const [moved] = items.splice(dragIndex, 1);
        items.splice(dropIndex, 0, moved);

        // Optimistic UI update
        setActiveSeq({ ...activeSeq, items });
        setDragIndex(null);
        setDragOverIndex(null);

        try {
            await reorderSequenceItems(
                activeSeq.id,
                items.map((i) => i.id)
            );
        } catch (e: any) {
            setError(e.message);
            await selectSequence(activeSeq.id);
        }
    };

    const moveItem = async (index: number, direction: 'up' | 'down') => {
        if (!activeSeq) return;
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= activeSeq.items.length) return;

        const items = [...activeSeq.items];
        [items[index], items[newIndex]] = [items[newIndex], items[index]];
        setActiveSeq({ ...activeSeq, items });

        try {
            await reorderSequenceItems(activeSeq.id, items.map((i) => i.id));
        } catch (e: any) {
            setError(e.message);
            await selectSequence(activeSeq.id);
        }
    };

    // ── Playback ──
    const handlePlaySequence = () => {
        if (!activeSeq || activeSeq.items.length === 0) return;
        setPlayingIndex(0);
        setPlayingSequence(true);
    };

    const handleVideoEnd = () => {
        if (!activeSeq) return;
        if (playingIndex < activeSeq.items.length - 1) {
            setPlayingIndex((prev) => prev + 1);
        } else {
            setPlayingSequence(false);
        }
    };

    // Validation
    const validation = activeSeq ? validateSequence(activeSeq.items) : null;

    const filteredPicker = allVideos.filter((v) => {
        if (pickerFilter !== 'all' && v.segment_category !== pickerFilter) return false;
        // Don't re-add same video
        if (activeSeq?.items.some((i) => i.video_id === v.id)) return false;
        return true;
    });

    return (
        <div className="sb-page">
            {/* ── Header ── */}
            <header className="sb-header">
                <button className="sb-back-btn" onClick={onBack}>← Back</button>
                <div className="sb-header-text">
                    <h1><Layers size={28} /> Sequence Builder</h1>
                    <p>String your videos together in order</p>
                </div>
                <div className="sb-header-actions">
                    <button className="sb-btn sb-btn-secondary" onClick={onOpenLibrary}>
                        ← Library
                    </button>
                    <button
                        className="sb-btn sb-btn-primary"
                        onClick={() => setShowNewForm(true)}
                    >
                        <Plus size={18} /> New Sequence
                    </button>
                </div>
            </header>

            {error && (
                <div className="sb-error">
                    <span>{error}</span>
                    <button onClick={() => setError(null)}><X size={14} /></button>
                </div>
            )}

            <div className="sb-layout">
                {/* ── Sidebar: Sequence List ── */}
                <aside className="sb-sidebar">
                    <h2>My Sequences</h2>
                    {loading ? (
                        <div className="sb-loading-mini"><div className="vl-spinner" /></div>
                    ) : sequences.length === 0 ? (
                        <p className="sb-empty-text">No sequences yet.</p>
                    ) : (
                        <ul className="sb-seq-list">
                            {sequences.map((seq) => (
                                <li
                                    key={seq.id}
                                    className={`sb-seq-item ${activeSeq?.id === seq.id ? 'active' : ''}`}
                                >
                                    {editingSeq === seq.id ? (
                                        <div className="sb-seq-edit-inline">
                                            <input
                                                value={editForm.title}
                                                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                                placeholder="Title"
                                                autoFocus
                                            />
                                            <div className="sb-seq-edit-actions">
                                                <button onClick={() => handleUpdateSequence(seq.id)}>
                                                    <CheckCircle size={14} />
                                                </button>
                                                <button onClick={() => setEditingSeq(null)}>
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <button
                                                className="sb-seq-select"
                                                onClick={() => selectSequence(seq.id)}
                                            >
                                                <Layers size={16} />
                                                <span>{seq.title}</span>
                                            </button>
                                            <div className="sb-seq-actions">
                                                <button
                                                    onClick={() => {
                                                        setEditingSeq(seq.id);
                                                        setEditForm({ title: seq.title, description: seq.description ?? '' });
                                                    }}
                                                >
                                                    <Edit3 size={14} />
                                                </button>
                                                <button
                                                    className="sb-danger"
                                                    onClick={() => handleDeleteSequence(seq.id)}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </aside>

                {/* ── Main Panel ── */}
                <main className="sb-main">
                    {!activeSeq ? (
                        <div className="sb-placeholder">
                            <Layers size={56} />
                            <h2>Select or create a sequence</h2>
                            <p>Pick one from the sidebar or create a new one to get started.</p>
                        </div>
                    ) : (
                        <>
                            <div className="sb-seq-header">
                                <div>
                                    <h2>{activeSeq.title}</h2>
                                    {activeSeq.description && <p>{activeSeq.description}</p>}
                                </div>
                                <div className="sb-seq-header-actions">
                                    <button
                                        className="sb-btn sb-btn-secondary"
                                        onClick={() => setShowAddPicker(true)}
                                    >
                                        <Plus size={16} /> Add Video
                                    </button>
                                    <button
                                        className="sb-btn sb-btn-primary"
                                        onClick={handlePlaySequence}
                                        disabled={activeSeq.items.length === 0}
                                    >
                                        <Play size={16} /> Play All
                                    </button>
                                </div>
                            </div>

                            {/* Validation warnings */}
                            {validation && !validation.valid && (
                                <div className="sb-validation">
                                    <AlertTriangle size={18} />
                                    <ul>
                                        {validation.errors.map((err, i) => (
                                            <li key={i}>{err}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {validation && validation.valid && activeSeq.items.length > 0 && (
                                <div className="sb-validation sb-valid">
                                    <CheckCircle size={18} />
                                    <span>Sequence is valid — has a beginning and an end!</span>
                                </div>
                            )}

                            {/* Timeline */}
                            {activeSeq.items.length === 0 ? (
                                <div className="sb-empty-timeline">
                                    <p>No videos in this sequence yet.</p>
                                    <button
                                        className="sb-btn sb-btn-primary"
                                        onClick={() => setShowAddPicker(true)}
                                    >
                                        <Plus size={16} /> Add your first video
                                    </button>
                                </div>
                            ) : (
                                <div className="sb-timeline">
                                    {activeSeq.items.map((item, index) => (
                                        <div
                                            key={item.id}
                                            className={`sb-timeline-item ${dragOverIndex === index ? 'drag-over' : ''
                                                }`}
                                            draggable
                                            onDragStart={() => handleDragStart(index)}
                                            onDragOver={(e) => handleDragOver(e, index)}
                                            onDrop={() => handleDrop(index)}
                                            onDragEnd={() => {
                                                setDragIndex(null);
                                                setDragOverIndex(null);
                                            }}
                                        >
                                            <div className="sb-tl-grip">
                                                <GripVertical size={18} />
                                            </div>

                                            <div className="sb-tl-order">
                                                <span>{index + 1}</span>
                                            </div>

                                            <div
                                                className="sb-tl-category"
                                                style={{
                                                    background: SEGMENT_COLORS[item.video.segment_category],
                                                }}
                                            >
                                                {item.video.segment_category}
                                            </div>

                                            <div className="sb-tl-info">
                                                <strong>{item.video.title}</strong>
                                                {item.video.description && (
                                                    <span className="sb-tl-desc">{item.video.description}</span>
                                                )}
                                            </div>

                                            <div className="sb-tl-actions">
                                                <button
                                                    onClick={() => moveItem(index, 'up')}
                                                    disabled={index === 0}
                                                    title="Move up"
                                                >
                                                    <ChevronUp size={16} />
                                                </button>
                                                <button
                                                    onClick={() => moveItem(index, 'down')}
                                                    disabled={index === activeSeq.items.length - 1}
                                                    title="Move down"
                                                >
                                                    <ChevronDown size={16} />
                                                </button>
                                                <button
                                                    className="sb-danger"
                                                    onClick={() => handleRemoveItem(item.id)}
                                                    title="Remove"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>

            {/* ── New Sequence Modal ── */}
            {showNewForm && (
                <div className="vl-modal-overlay" onClick={() => setShowNewForm(false)}>
                    <div className="vl-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="vl-modal-header">
                            <h2>Create Sequence</h2>
                            <button onClick={() => setShowNewForm(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreateSequence} className="vl-form">
                            <label>
                                <span>Title *</span>
                                <input
                                    type="text"
                                    required
                                    value={newForm.title}
                                    onChange={(e) => setNewForm({ ...newForm, title: e.target.value })}
                                    placeholder="e.g. Morning Meditation Flow"
                                />
                            </label>
                            <label>
                                <span>Description</span>
                                <textarea
                                    value={newForm.description}
                                    onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                                    placeholder="What is this sequence for?"
                                    rows={3}
                                />
                            </label>
                            <button
                                type="submit"
                                className="vl-btn vl-btn-primary vl-btn-full"
                                disabled={saving}
                            >
                                {saving ? 'Creating…' : <><Plus size={16} /> Create Sequence</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Add Video Picker Modal ── */}
            {showAddPicker && (
                <div className="vl-modal-overlay" onClick={() => setShowAddPicker(false)}>
                    <div className="sb-picker-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="vl-modal-header">
                            <h2>Add Video to Sequence</h2>
                            <button onClick={() => setShowAddPicker(false)}><X size={20} /></button>
                        </div>

                        <div className="sb-picker-filters">
                            {(['all', 'beginning', 'middle', 'end'] as const).map((cat) => (
                                <button
                                    key={cat}
                                    className={`vl-chip ${pickerFilter === cat ? 'active' : ''}`}
                                    style={
                                        cat !== 'all' && pickerFilter === cat
                                            ? { borderColor: SEGMENT_COLORS[cat], color: SEGMENT_COLORS[cat] }
                                            : {}
                                    }
                                    onClick={() => setPickerFilter(cat)}
                                >
                                    {cat === 'all' ? '🎬 All' : SEGMENT_LABELS[cat]}
                                </button>
                            ))}
                        </div>

                        <div className="sb-picker-list">
                            {filteredPicker.length === 0 ? (
                                <p className="sb-empty-text">No available videos match this filter.</p>
                            ) : (
                                filteredPicker.map((video) => (
                                    <button
                                        key={video.id}
                                        className="sb-picker-item"
                                        onClick={() => handleAddVideo(video)}
                                    >
                                        <div
                                            className="sb-picker-badge"
                                            style={{ background: SEGMENT_COLORS[video.segment_category] }}
                                        >
                                            {video.segment_category}
                                        </div>
                                        <div className="sb-picker-info">
                                            <strong>{video.title}</strong>
                                            {video.description && <span>{video.description}</span>}
                                        </div>
                                        <Plus size={18} />
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Playback Overlay ── */}
            {playingSequence && activeSeq && (
                <div className="sb-playback-overlay">
                    <div className="sb-playback-controls">
                        <span>
                            Playing {playingIndex + 1} / {activeSeq.items.length}
                            {' — '}
                            <strong>{activeSeq.items[playingIndex].video.title}</strong>
                        </span>
                        <button onClick={() => setPlayingSequence(false)}>
                            <X size={20} /> Close
                        </button>
                    </div>
                    <video
                        ref={videoRef}
                        key={activeSeq.items[playingIndex].video.url}
                        src={activeSeq.items[playingIndex].video.url}
                        autoPlay
                        controls
                        className="sb-playback-video"
                        onEnded={handleVideoEnd}
                    />
                </div>
            )}
        </div>
    );
};

export default SequenceBuilder;
