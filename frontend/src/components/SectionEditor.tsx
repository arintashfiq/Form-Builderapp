import React, { useState, useEffect } from 'react';
import { X, Save, Settings } from 'lucide-react';
import { FormSection } from '../types';

interface SectionEditorProps {
  section: FormSection;
  sections: FormSection[]; // All sections for next section dropdown
  onUpdate: (updates: Partial<FormSection>) => void;
  onClose: () => void;
}

export default function SectionEditor({ section, sections, onUpdate, onClose }: SectionEditorProps) {
  const [title, setTitle] = useState(section.title);
  const [description, setDescription] = useState(section.description || '');
  const [allowSubmit, setAllowSubmit] = useState(section.allowSubmit ?? true);
  const [allowNext, setAllowNext] = useState(section.allowNext ?? true);
  const [nextSectionId, setNextSectionId] = useState(section.nextSectionId || '');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const hasChanges = 
      title !== section.title ||
      description !== (section.description || '') ||
      allowSubmit !== (section.allowSubmit ?? true) ||
      allowNext !== (section.allowNext ?? true) ||
      nextSectionId !== (section.nextSectionId || '');
    
    setHasUnsavedChanges(hasChanges);
  }, [title, description, allowSubmit, allowNext, nextSectionId, section]);

  const handleSave = () => {
    const updates: Partial<FormSection> = {
      title: title.trim(),
      description: description.trim() || undefined,
      allowSubmit,
      allowNext,
      nextSectionId: allowNext && nextSectionId ? nextSectionId : undefined,
    };

    console.log('💾 SectionEditor saving updates:', {
      sectionId: section.id,
      sectionTitle: section.title,
      updates,
      originalNextSectionId: section.nextSectionId,
      newNextSectionId: updates.nextSectionId
    });

    onUpdate(updates);
    onClose();
  };

  const handleCancel = () => {
    setTitle(section.title);
    setDescription(section.description || '');
    setAllowSubmit(section.allowSubmit ?? true);
    setAllowNext(section.allowNext ?? true);
    setNextSectionId(section.nextSectionId || '');
    onClose();
  };

  // Get available next sections (exclude current section)
  const availableNextSections = sections
    .filter(s => s.id !== section.id)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Section Settings</h3>
          {hasUnsavedChanges && (
            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
              Unsaved
            </span>
          )}
        </div>
        <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Section Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter section title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter section description"
              rows={2}
            />
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Navigation Controls</h4>
          
          {/* Allow Submit Toggle */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Allow Form Submission
                </label>
                <p className="text-xs text-gray-500">
                  Users can submit the form from this section
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowSubmit}
                  onChange={(e) => setAllowSubmit(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Allow Next Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Allow Next Button
                </label>
                <p className="text-xs text-gray-500">
                  Users can navigate to the next section
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowNext}
                  onChange={(e) => setAllowNext(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Next Section Selector */}
            {allowNext && (
              <div className="ml-4 pl-4 border-l-2 border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Next Section
                </label>
                <select
                  value={nextSectionId}
                  onChange={(e) => setNextSectionId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sequential (next in order)</option>
                  {availableNextSections.map((nextSection) => (
                    <option key={nextSection.id} value={nextSection.id}>
                      {nextSection.title}
                    </option>
                  ))}
                  <option value="end">Submit Form</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Leave as "Sequential" for normal order, or choose a specific section
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="border-t pt-4">
          <button
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
            className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Section Settings
          </button>
        </div>
      </div>
    </div>
  );
}