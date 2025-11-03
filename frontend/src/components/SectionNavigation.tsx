import React from 'react';
import { ChevronRight } from 'lucide-react';

interface SectionNavigationProps {
  currentSection: number;
  totalSections: number;
  canGoNext: boolean;
  onNext: () => void;
  sectionTitles: string[];
}

export default function SectionNavigation({
  currentSection,
  totalSections,
  canGoNext,
  onNext,
  sectionTitles,
}: SectionNavigationProps) {
  return (
    <div className="border-t bg-gray-50 p-4">
      <div className="flex items-center justify-center sm:justify-end">
        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext}
          className="inline-flex items-center px-6 py-3 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-sm font-medium"
        >
          Next
          <ChevronRight className="h-5 w-5 sm:h-4 sm:w-4 ml-1" />
        </button>
      </div>
    </div>
  );
}
