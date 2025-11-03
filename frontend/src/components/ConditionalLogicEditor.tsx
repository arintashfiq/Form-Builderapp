import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { ConditionalRule, FormSection } from '../types';

interface ConditionalLogicEditorProps {
  options: string[];
  rules: ConditionalRule[];
  sections: FormSection[];
  onChange: (rules: ConditionalRule[]) => void;
}

export default function ConditionalLogicEditor({
  options,
  rules,
  sections,
  onChange,
}: ConditionalLogicEditorProps) {
  const addRule = () => {
    const newRule: ConditionalRule = {
      answer: options[0] || '',
      targetSectionId: sections[0]?.id || 'end',
    };
    onChange([...rules, newRule]);
  };

  const updateRule = (index: number, updates: Partial<ConditionalRule>) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], ...updates };
    onChange(newRules);
  };

  const removeRule = (index: number) => {
    onChange(rules.filter((_, i) => i !== index));
  };

  if (options.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        Add dropdown options first to configure conditional logic
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Conditional Logic
        </label>
        <button
          type="button"
          onClick={addRule}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Rule
        </button>
      </div>

      {rules.length === 0 ? (
        <div className="text-sm text-gray-500 italic">
          No conditional rules. Click "Add Rule" to create navigation logic.
        </div>
      ) : (
        <div className="space-y-2">
          {rules.map((rule, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
              <span className="text-sm text-gray-600">If answer is</span>
              <select
                value={rule.answer}
                onChange={(e) => updateRule(index, { answer: e.target.value })}
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-600">go to</span>
              <select
                value={rule.targetSectionId}
                onChange={(e) => updateRule(index, { targetSectionId: e.target.value })}
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.title}
                  </option>
                ))}
                <option value="end">Submit Form</option>
              </select>
              <button
                type="button"
                onClick={() => removeRule(index)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="text-xs text-gray-500 mt-2">
        💡 Tip: If no rule matches the selected answer, the form will proceed to the next section.
      </div>
    </div>
  );
}
