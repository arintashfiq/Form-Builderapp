# Sections & Conditional Logic Guide

## Overview
The form builder now supports multi-section forms with conditional navigation, similar to Google Forms. Each section acts as a separate screen, and you can configure dropdown fields to navigate to different sections based on the user's answer.

## Key Features

### 1. **Sections**
- Each form can have multiple sections
- Sections are displayed one at a time (like pages)
- Each section has:
  - Title
  - Description (optional)
  - Its own columns for layout
  - Order number for sequencing

### 2. **Conditional Logic**
- Available for dropdown fields only
- Configure rules like: "If answer is X, go to Section Y"
- Can also configure to submit the form directly
- If no rule matches, the form proceeds to the next section

### 3. **Section Navigation**
- Previous/Next buttons appear when there are multiple sections
- Submit button only appears on the last section
- Users can navigate back to previous sections
- Validation happens per-section (must complete current section before proceeding)

## How to Use

### Creating Sections
1. When creating a new form, it starts with one default section
2. Each section can have multiple columns for organizing fields
3. Fields are assigned to sections via their `sectionId` property

### Adding Conditional Logic
1. Add a dropdown field to your form
2. Add options to the dropdown (e.g., "Yes", "No", "Maybe")
3. In the Field Editor, you'll see "Conditional Logic" section (only if you have 2+ sections)
4. Click "Add Rule" to create navigation rules
5. For each rule, select:
   - **Answer**: Which dropdown option triggers this rule
   - **Target**: Which section to navigate to (or "Submit Form")

### Example Use Case
**Customer Satisfaction Survey:**
- Section 1: "How satisfied are you?" 
  - Dropdown: "Very Satisfied", "Satisfied", "Unsatisfied"
  - Logic: 
    - If "Very Satisfied" → Go to "Thank You" section
    - If "Satisfied" → Go to "Feedback" section
    - If "Unsatisfied" → Go to "Complaint Details" section

## Technical Details

### Data Structure
```typescript
interface FormSection {
  id: string;
  title: string;
  description?: string;
  order: number;
  columns: FormColumn[]; // Each section has its own columns
}

interface ConditionalLogic {
  conditions: ConditionalRule[];
}

interface ConditionalRule {
  answer: string; // The dropdown option that triggers this rule
  targetSectionId: string; // Target section ID or "end" to submit
}
```

### Preview Behavior
- Form displays one section at a time
- Section navigation buttons appear at the bottom
- When a dropdown with conditional logic is changed:
  1. The value is saved
  2. Conditional rules are checked
  3. If a matching rule is found, navigate to target section
  4. If no match, user can manually navigate with Next button
- Submit button only appears on the last section

### Backward Compatibility
- Forms without sections use the legacy column layout
- Existing forms continue to work without modification
- The `columns` property at form level is kept for backward compatibility

## Best Practices

1. **Keep sections focused**: Each section should have a clear purpose
2. **Use descriptive titles**: Help users understand what information is needed
3. **Test conditional logic**: Make sure all paths lead somewhere
4. **Provide a default path**: Not all dropdown answers need conditional logic
5. **Consider the flow**: Think about the user journey through your form

## Limitations

- Conditional logic only works with dropdown fields
- Cannot create loops (section A → section B → section A)
- All sections must be reachable or users may miss them
- Validation is per-section, not per-field during navigation
