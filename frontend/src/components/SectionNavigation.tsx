import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SectionNavigationProps {
  currentSection: number;
  totalSections: number;
  canGoNext: boolean;
  canGoPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
  sectionTitles: string[];
}

export default function SectionNavigation({
  currentSection,
  totalSections,
  canGoNext,
  canGoPrevious,
  onNext,
  onPrevious,
  sectionTitles,
}: SectionNavigationProps) {
  return (
    <div className="border-t bg-gray-50 p-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </button>

        <div className="text-sm text-gray-600">
          Section {currentSection + 1} of {totalSections}
          {sectionTitles[currentSection] && (
            <span className="ml-2 font-medium">{sectionTitles[currentSection]}</span>
          )}
        </div>

        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>
    </div>
  );
}
