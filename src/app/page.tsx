'use client';

import Header from '@/components/Header';
import StreamInput from '@/components/StreamInput';
import ThoughtFeed from '@/components/ThoughtFeed';
import DropZoneOverlay from '@/components/DropZoneOverlay';
import { useThoughts } from '@/hooks/useThoughts';
import { useDropZone } from '@/hooks/useDropZone';

export default function Home() {
  const { thoughts, isLoading, addThought, deleteThought, toggleTask } =
    useThoughts();
  const { isDragging } = useDropZone();

  const status = isLoading ? 'processing' : 'connected';

  return (
    <>
      <Header status={status} />

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-8">
        <StreamInput onSubmit={addThought} />

        <ThoughtFeed
          thoughts={thoughts}
          isLoading={isLoading}
          onDelete={deleteThought}
          onToggleTask={toggleTask}
        />
      </main>

      <DropZoneOverlay isDragging={isDragging} />
    </>
  );
}
