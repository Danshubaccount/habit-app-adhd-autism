import React, { useMemo, useState } from 'react';
import useLocalStorage from '../../../hooks/useLocalStorage';

type IntakeKey =
    | 'supportWith'
    | 'sessionGoal'
    | 'patternWhen'
    | 'preEmotion'
    | 'patternFunction'
    | 'innerPart'
    | 'origin'
    | 'beliefs'
    | 'replacement'
    | 'somatic'
    | 'safety'
    | 'style';

type StylePreference = 'gentle' | 'direct' | 'visual' | 'body';
type SafetyChoice = 'safe' | 'needs-support' | '';

interface IntakeStep {
    key: IntakeKey;
    title: string;
    assistant: string[];
    prompt: string;
    helper?: string[];
    placeholder?: string;
}

interface IntakeAnswers {
    supportWith: string;
    sessionGoal: string;
    patternWhen: string;
    preEmotion: string;
    patternFunction: string;
    innerPart: string;
    origin: string;
    beliefs: string;
    replacement: string;
    somatic: string;
    safety: string;
    style: StylePreference | '';
}

interface GeneratedOutput {
    script: string;
    anchor: string;
}

interface StoredAnchor {
    createdAt: string;
    trigger: string;
    anchor: string;
}

const DEFAULT_ANSWERS: IntakeAnswers = {
    supportWith: '',
    sessionGoal: '',
    patternWhen: '',
    preEmotion: '',
    patternFunction: '',
    innerPart: '',
    origin: '',
    beliefs: '',
    replacement: '',
    somatic: '',
    safety: '',
    style: '',
};

const STYLE_OPTIONS: Array<{ id: StylePreference; label: string; description: string }> = [
    {
        id: 'gentle',
        label: 'Gentle and permissive',
        description: 'Soft language with spacious pacing, like "you may begin to notice..."',
    },
    {
        id: 'direct',
        label: 'Direct and confident',
        description: 'Clear and steady language, like "you will feel calm and steady..."',
    },
    {
        id: 'visual',
        label: 'Visual and imaginative',
        description: 'Scenes, symbols, and metaphor-led guidance.',
    },
    {
        id: 'body',
        label: 'Body-based and calming',
        description: 'Breath, muscle release, and nervous-system settling.',
    },
];

const INTAKE_STEPS: IntakeStep[] = [
    {
        key: 'supportWith',
        title: 'Screen 1 - Trust + Orientation',
        assistant: [
            'Welcome.',
            'Before we begin, take a breath.',
            'This space is designed to help you gently shift patterns that feel stuck - whether emotional, behavioral, or mental.',
            'Hypnosis is not mind control. It is a focused, relaxed state where your brain becomes more open to new learning.',
            'You are always in control, and nothing happens without your consent.',
        ],
        prompt: 'What would you like support with today?',
        placeholder: 'Share the challenge in your own words...',
    },
    {
        key: 'sessionGoal',
        title: "Screen 2 - Today's Goal",
        assistant: [
            "Thank you. That's a meaningful place to start.",
            "If today's session worked perfectly, what would feel different afterward?",
        ],
        prompt: 'What would feel different after a successful session?',
        helper: ['Examples: calmer, more confident, less compulsive, more in control, more at peace.'],
        placeholder: 'Describe the shift you want to feel...',
    },
    {
        key: 'patternWhen',
        title: 'Screen 3 - Pattern Clarification',
        assistant: [
            'Let us get specific so this can be truly personalized.',
            'When does this issue show up most strongly in your real life?',
        ],
        prompt: 'When and where does this pattern tend to appear?',
        helper: ['Times of day', 'Situations', 'People or environments'],
        placeholder: 'For example: late evenings, before meetings, when I feel judged...',
    },
    {
        key: 'preEmotion',
        title: 'Screen 4 - Emotional Trigger',
        assistant: ['Right before it happens, what are you usually feeling?'],
        prompt: 'What emotional state is closest right before the pattern starts?',
        helper: ['stress', 'loneliness', 'boredom', 'pressure', 'sadness', 'anger', 'overwhelm', 'restlessness'],
        placeholder: 'Name what you feel right before it happens...',
    },
    {
        key: 'patternFunction',
        title: 'Screen 5 - Functional Role',
        assistant: [
            'This is an important question.',
            'If this pattern is trying to help you somehow, what might it be doing for you?',
        ],
        prompt: 'What do you think this pattern provides?',
        helper: ['comfort', 'distraction', 'protection', 'control', 'relief', 'reward', 'numbness', 'escape'],
        placeholder: 'In your words, what does this pattern try to do for you?',
    },
    {
        key: 'innerPart',
        title: 'Screen 6 - Parts / Inner Conflict',
        assistant: [
            'Many people experience this as a part of them taking over.',
            'Does it feel like there is a part of you doing this for a reason?',
        ],
        prompt: 'If that part could speak, what would it want for you, and what is it afraid of?',
        placeholder: 'Describe the protective part and its fears...',
    },
    {
        key: 'origin',
        title: 'Screen 7 - Origin Trace',
        assistant: [
            'Patterns usually have a beginning.',
            'When do you remember this first starting, even roughly?',
        ],
        prompt: 'When did this pattern begin?',
        helper: ['childhood', 'teenage years', 'adulthood', 'after a major life event', 'no clear origin'],
        placeholder: 'Share the earliest time you can remember...',
    },
    {
        key: 'beliefs',
        title: 'Screen 8 - Beliefs + Identity',
        assistant: [
            'Sometimes the hardest part is not the behavior, but what it means.',
            'When this happens, what do you tend to believe about yourself?',
        ],
        prompt: 'What belief about yourself comes up most strongly?',
        helper: ['"I am not in control"', '"Something is wrong with me"', '"I always mess up"', '"I cannot change"'],
        placeholder: 'Complete this in your words: "When this happens, I tell myself..."',
    },
    {
        key: 'replacement',
        title: 'Screen 9 - Desired Replacement',
        assistant: [
            'Beautiful. Now let us define what we are building toward.',
            'When this trigger happens in the future, how would you like to respond instead?',
        ],
        prompt: 'What does your healthier pattern look like?',
        placeholder: 'Describe your preferred response in that moment...',
    },
    {
        key: 'somatic',
        title: 'Screen 10 - Body + Somatic Signals',
        assistant: [
            'One more layer.',
            'Where do you feel this pattern in your body, and what would calm feel like physically?',
        ],
        prompt: 'Where does this live in your body, and what does calm feel like there?',
        helper: ['chest tightness', 'restlessness', 'heaviness', 'buzzing', 'craving', 'numbness'],
        placeholder: 'Example: tight chest shifts into warm shoulders and steady breathing...',
    },
    {
        key: 'safety',
        title: 'Screen 11 - Safety Screening',
        assistant: [
            'Before we continue, I want to check something important.',
            'Have any of these been part of your experience: severe overwhelming trauma, self-harm urges, eating disorder behaviors, panic, or dissociation episodes?',
            'If yes, this tool may not be the right support alone, and licensed support is recommended.',
        ],
        prompt: 'Is it safe to continue right now?',
        placeholder: 'Optional: add context if you want me to understand your safety answer...',
    },
    {
        key: 'style',
        title: 'Screen 12 - Personalization Style',
        assistant: [
            'Last question before I create your session.',
            'What style would you like for your hypnosis guidance?',
        ],
        prompt: 'Choose the style that fits you best.',
    },
];

const sectionCardStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '760px',
    margin: '0 auto',
    padding: '2rem',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--glass-border)',
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(var(--glass-blur))',
    WebkitBackdropFilter: 'blur(var(--glass-blur))',
    textAlign: 'left',
};

const textAreaStyle: React.CSSProperties = {
    width: '100%',
    minHeight: '150px',
    resize: 'vertical',
    padding: '1rem',
    borderRadius: 'var(--radius-sm)',
    border: '2px solid var(--border-color)',
    background: 'var(--secondary-color)',
    color: 'var(--text-primary)',
    boxSizing: 'border-box',
    fontSize: '1rem',
    lineHeight: 1.6,
    fontFamily: 'var(--font-body)',
};

const buttonRowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '1rem',
    marginTop: '1.5rem',
    flexWrap: 'wrap',
};

const isHighRiskInput = (allText: string): boolean => {
    const patterns = [
        /self[-\s]?harm/i,
        /suicid/i,
        /\bpurging?\b/i,
        /\bstarv(?:e|ing|ation)\b/i,
    ];
    return patterns.some((pattern) => pattern.test(allText));
};

const hasCautionSignals = (allText: string): boolean => {
    const patterns = [
        /\bdissociat/i,
        /\boverwhelming trauma\b/i,
        /\bpanic attacks?\b/i,
        /\bsevere trauma\b/i,
    ];
    return patterns.some((pattern) => pattern.test(allText));
};

const safeSnippet = (value: string, fallback: string): string => {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : fallback;
};

const toAnchorPhrase = (replacement: string, goal: string): string => {
    const source = safeSnippet(replacement, safeSnippet(goal, 'steady and calm'));
    const plain = source.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!plain) return 'steady and calm';
    return plain.split(' ').slice(0, 6).join(' ').toLowerCase();
};

const joinParagraphs = (parts: string[]): string => parts.join('\n\n');

const buildScript = (answers: IntakeAnswers, anchorPhrase: string, cautiousMode: boolean): string => {
    const supportWith = safeSnippet(answers.supportWith, 'this pattern');
    const goal = safeSnippet(answers.sessionGoal, 'feeling calm and in control');
    const patternWhen = safeSnippet(answers.patternWhen, 'in certain stressful moments');
    const preEmotion = safeSnippet(answers.preEmotion, 'a wave of stress');
    const patternFunction = safeSnippet(answers.patternFunction, 'short-term relief');
    const innerPart = answers.innerPart.trim();
    const origin = answers.origin.trim();
    const beliefs = safeSnippet(answers.beliefs, 'I cannot change');
    const replacement = safeSnippet(answers.replacement, 'pause, breathe, and choose your next response');
    const somatic = safeSnippet(answers.somatic, 'steady breath and softened muscles');

    const stylePrefix =
        answers.style === 'direct'
            ? 'You can notice a steady confidence growing.'
            : answers.style === 'visual'
                ? 'You may begin to imagine this gently.'
                : answers.style === 'body'
                    ? 'You may begin by listening to your body.'
                    : 'You may begin to notice a gentle shift.';

    const imageryLine =
        answers.style === 'visual'
            ? 'Perhaps you imagine a quiet path, soft light, and each step becoming calmer.'
            : 'You may picture a safe, peaceful place where your attention can rest.';

    const bodyLine =
        answers.style === 'body'
            ? 'Notice the breath moving low and easy, and allow jaw, shoulders, and chest to soften.'
            : 'Notice a natural rhythm in the breath, and allow your body to settle in its own way.';

    return joinParagraphs([
        `Welcome... This is your time. You remain in control the whole way through. ${stylePrefix}`,
        `As this begins, allow yourself to orient toward what you most want today... ${goal}... (pause)`,
        `This session supports your movement through ${supportWith} with more calm, agency, and self-trust.`,
        'Take a slow breath in... and a longer breath out... (pause)',
        'Again... easy inhale... unhurried exhale... (pause)',
        `${bodyLine} Bring gentle awareness to ${somatic} and allow even two percent more ease there.`,
        'If thoughts appear, that is okay. You may let them pass and return to breath... return to body... return to this moment.',
        `${imageryLine}`,
        'As you hear each number, you may settle more deeply.',
        'Ten... softening.',
        'Nine... slowing down.',
        'Eight... more settled.',
        'Seven... more present.',
        'Six... drifting inward.',
        'Five... halfway and safe.',
        'Four... steady.',
        'Three... calm.',
        'Two... grounded.',
        'One... deeply focused and at ease... (pause)',
        `Now bring to mind the moments when this pattern shows up... ${patternWhen}.`,
        `Right before it, you may notice feelings like ${preEmotion}.`,
        `There is wisdom in how this pattern formed. It has tried to offer ${patternFunction}.`,
        'You may thank the protective system for trying to help, even when the strategy no longer fits.',
        innerPart
            ? `And to the part of you connected to this... ${innerPart}... thank you for trying to protect. You may take on a new role now: early signal, gentle support, steady guidance.`
            : 'If there is any protective part present, you may thank it now and invite it into a new role of calm guidance.',
        origin && !cautiousMode
            ? `This pattern may have been with you since ${origin}. You do not need to revisit old pain. You may simply allow new learning now.`
            : 'You do not need to revisit old memories. You may simply allow new learning now.',
        cautiousMode
            ? 'If anything intense appears, let it remain at a distance. Return to the breath. Return to the room. Return to safety... (pause)'
            : 'As your nervous system settles, new options become easier to feel and easier to choose.',
        `Notice the old belief... ${beliefs}... and allow it to soften.`,
        'You may widen into a truer identity now.',
        'You are learning.',
        'You are adaptable.',
        'You are capable of choice.',
        'Now imagine a future moment... the same kind of moment when the old pattern used to begin.',
        `It starts in the familiar context... ${patternWhen}... and you notice it early.`,
        'You pause.',
        'You breathe.',
        'You soften the body.',
        `Then you choose your new response... ${replacement}.`,
        `Feel what that is like in your body... ${somatic}... steady and clear... (pause)`,
        'Run that scene again, calmly and clearly.',
        'And once more, with even more ease.',
        'Let this become familiar.',
        'Let this become natural.',
        `Now create a subtle anchor. As you breathe out, you may lightly touch thumb and finger together and say inside... ${anchorPhrase}...`,
        'Each time this cue appears, you may notice one longer exhale, one softer jaw, one clear choice.',
        'Trigger... breath... space... choice.',
        'Trigger... breath... space... choice... (pause)',
        'Now gently return at your own pace.',
        'One... feeling breath deepen.',
        'Two... awareness expanding.',
        'Three... energy returning to hands and feet.',
        'Four... shoulders and neck alert and comfortable.',
        'Five... eyes open when ready, feeling present, clear, and steady.',
        'Take one final breath... and carry this self-trust into the rest of your day.',
    ]);
};

const Hypnosis: React.FC = () => {
    const [answers, setAnswers] = useState<IntakeAnswers>(DEFAULT_ANSWERS);
    const [currentStep, setCurrentStep] = useState(0);
    const [safetyChoice, setSafetyChoice] = useState<SafetyChoice>('');
    const [showResult, setShowResult] = useState(false);
    const [highRisk, setHighRisk] = useState(false);
    const [generated, setGenerated] = useState<GeneratedOutput | null>(null);
    const [, setSavedAnchors] = useLocalStorage<StoredAnchor[]>('hypnosis_trigger_anchors', []);

    const step = INTAKE_STEPS[currentStep];

    const canContinue = useMemo(() => {
        if (step.key === 'safety') return safetyChoice !== '';
        if (step.key === 'style') return answers.style !== '';
        return answers[step.key].trim().length > 0;
    }, [answers, safetyChoice, step.key]);

    const updateAnswer = (key: IntakeKey, value: string) => {
        setAnswers((prev) => ({ ...prev, [key]: value }));
    };

    const finalize = () => {
        const safetyText = `${safetyChoice} ${answers.safety}`.trim();
        const mergedText = Object.values(answers).join(' ').concat(` ${safetyText}`);
        const highRiskDetected = safetyChoice === 'needs-support' || isHighRiskInput(mergedText);
        const cautionDetected = hasCautionSignals(safetyText);
        setHighRisk(highRiskDetected);

        if (highRiskDetected) {
            setGenerated(null);
            setShowResult(true);
            return;
        }

        const anchor = toAnchorPhrase(answers.replacement, answers.sessionGoal);
        const script = buildScript(answers, anchor, cautionDetected);
        setGenerated({ script, anchor });

        const nextEntry: StoredAnchor = {
            createdAt: new Date().toISOString(),
            trigger: safeSnippet(answers.patternWhen, 'trigger moment'),
            anchor,
        };
        setSavedAnchors((prev) => [nextEntry, ...prev].slice(0, 25));
        setShowResult(true);
    };

    const onNext = () => {
        if (step.key === 'safety') {
            updateAnswer('safety', answers.safety);
        }

        if (currentStep === INTAKE_STEPS.length - 1) {
            finalize();
            return;
        }

        setCurrentStep((prev) => prev + 1);
    };

    const resetFlow = () => {
        setAnswers(DEFAULT_ANSWERS);
        setCurrentStep(0);
        setSafetyChoice('');
        setGenerated(null);
        setHighRisk(false);
        setShowResult(false);
    };

    if (showResult) {
        if (highRisk) {
            return (
                <div style={{ width: '100%' }} className="animate-fade-in">
                    <div style={sectionCardStyle}>
                        <h2 style={{ marginTop: 0, marginBottom: '0.75rem', fontFamily: 'var(--font-serif)' }}>Pause for Safety</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Thank you for sharing honestly. Based on what you entered, this tool should pause here and not generate hypnosis content on its own.
                        </p>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            The safest next step is support from a licensed mental health professional. If you are in immediate danger or might act on self-harm urges, call emergency services now. In the U.S., you can also call or text 988 for immediate crisis support.
                        </p>
                        <div style={buttonRowStyle}>
                            <button className="btn-premium btn-premium-secondary" onClick={resetFlow}>
                                Start Again
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div style={{ width: '100%' }} className="animate-fade-in">
                <div style={{ ...sectionCardStyle, marginBottom: '1rem' }}>
                    <pre
                        style={{
                            margin: 0,
                            whiteSpace: 'pre-wrap',
                            fontFamily: 'var(--font-body)',
                            lineHeight: 1.9,
                            color: 'var(--text-primary)',
                        }}
                    >
                        {generated?.script}
                    </pre>
                </div>

                <div style={sectionCardStyle}>
                    <div style={buttonRowStyle}>
                        <button className="btn-premium btn-premium-secondary" onClick={resetFlow}>
                            Start New Intake
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ width: '100%' }} className="animate-fade-in">
            <div style={sectionCardStyle}>
                <div style={{ marginBottom: '1rem' }}>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                        {step.title} | {currentStep + 1} / {INTAKE_STEPS.length}
                    </p>
                    <h2 style={{ margin: '0.5rem 0 0', fontFamily: 'var(--font-serif)' }}>AI Therapeutic Hypnosis Intake</h2>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    {step.assistant.map((line) => (
                        <p key={line} style={{ color: 'var(--text-secondary)', margin: '0 0 0.75rem 0' }}>
                            {line}
                        </p>
                    ))}
                    <p style={{ marginBottom: '0.75rem', fontWeight: 700 }}>{step.prompt}</p>
                    {step.helper && (
                        <ul style={{ marginTop: 0, color: 'var(--text-secondary)', paddingLeft: '1.25rem' }}>
                            {step.helper.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    )}
                </div>

                {step.key === 'style' ? (
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {STYLE_OPTIONS.map((option) => {
                            const selected = answers.style === option.id;
                            return (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => setAnswers((prev) => ({ ...prev, style: option.id }))}
                                    className="btn-premium btn-premium-secondary"
                                    style={{
                                        justifyContent: 'flex-start',
                                        textAlign: 'left',
                                        border: selected ? '2px solid var(--primary-color)' : '1px solid var(--glass-border)',
                                        background: selected ? 'var(--primary-soft)' : 'var(--glass-bg)',
                                    }}
                                >
                                    <span>
                                        <strong>{option.label}</strong>
                                        <span style={{ display: 'block', fontWeight: 400, color: 'var(--text-secondary)' }}>
                                            {option.description}
                                        </span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                ) : step.key === 'safety' ? (
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                            <button
                                type="button"
                                className="btn-premium btn-premium-secondary"
                                onClick={() => setSafetyChoice('safe')}
                                style={{
                                    border: safetyChoice === 'safe' ? '2px solid var(--success-color)' : '1px solid var(--glass-border)',
                                    background: safetyChoice === 'safe' ? 'rgba(16,185,129,0.15)' : 'var(--glass-bg)',
                                }}
                            >
                                Yes, it is safe to continue
                            </button>
                            <button
                                type="button"
                                className="btn-premium btn-premium-secondary"
                                onClick={() => setSafetyChoice('needs-support')}
                                style={{
                                    border: safetyChoice === 'needs-support' ? '2px solid var(--danger-color)' : '1px solid var(--glass-border)',
                                    background: safetyChoice === 'needs-support' ? 'rgba(239,68,68,0.15)' : 'var(--glass-bg)',
                                }}
                            >
                                No, I may need professional support
                            </button>
                        </div>
                        <textarea
                            value={answers.safety}
                            onChange={(event) => updateAnswer('safety', event.target.value)}
                            placeholder={step.placeholder}
                            style={textAreaStyle}
                        />
                    </div>
                ) : (
                    <textarea
                        value={answers[step.key]}
                        onChange={(event) => updateAnswer(step.key, event.target.value)}
                        placeholder={step.placeholder}
                        style={textAreaStyle}
                    />
                )}

                <div style={buttonRowStyle}>
                    <button
                        className="btn-premium btn-premium-secondary"
                        onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
                        disabled={currentStep === 0}
                        style={{ opacity: currentStep === 0 ? 0.5 : 1 }}
                    >
                        Previous
                    </button>
                    <button
                        className="btn-premium btn-premium-primary"
                        onClick={onNext}
                        disabled={!canContinue}
                        style={{ opacity: canContinue ? 1 : 0.5 }}
                    >
                        {currentStep === INTAKE_STEPS.length - 1 ? 'Generate Session' : 'Continue'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Hypnosis;
