import React, { useState } from 'react';
import VideoLibrary from './VideoLibrary';
import SequenceBuilder from './SequenceBuilder';

type View = 'library' | 'sequences';

interface Props {
    onBack: () => void;
}

const VideoHub: React.FC<Props> = ({ onBack }) => {
    const [view, setView] = useState<View>('library');

    if (view === 'sequences') {
        return (
            <SequenceBuilder
                onBack={onBack}
                onOpenLibrary={() => setView('library')}
            />
        );
    }

    return (
        <VideoLibrary
            onBack={onBack}
            onOpenSequences={() => setView('sequences')}
        />
    );
};

export default VideoHub;
