// Re-export shared types for frontend use
export * from '../../../shared/types';

// Frontend-specific types
export interface FormNavigationState {
  currentSectionId: string;
  visitedSections: string[];
  sectionProgress: number;
  totalSections: number;
}