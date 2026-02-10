import { MemeLibrary } from '@/components/library/MemeLibrary';

export default function MemesPage() {
  return (
    <div className="flex flex-col gap-4 py-4 px-4 md:gap-6 md:py-6 lg:px-6">
      <MemeLibrary />
    </div>
  );
}
