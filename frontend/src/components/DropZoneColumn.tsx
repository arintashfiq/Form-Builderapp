import React from 'react';
import { useDrop } from 'react-dnd';
import { FormColumn } from '../types';

interface DropZoneColumnProps {
  column: FormColumn;
  fieldsInColumn: number;
  onFieldDrop: (fieldId: string, columnId: string) => void;
  onColumnClick: () => void;
}

export default function DropZoneColumn({ 
  column, 
  fieldsInColumn, 
  onFieldDrop, 
  onColumnClick 
}: DropZoneColumnProps) {
  const [{ isOver }, drop] = useDrop({
    accept: 'field',
    drop: (item: { id: string }) => {
      onFieldDrop(item.id, column.id);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop}
      onClick={onColumnClick}
      className={`w-full text-left px-2 py-2 text-sm rounded border-2 border-dashed transition-colors cursor-pointer ${
        isOver 
          ? 'border-blue-500 bg-blue-100' 
          : 'border-gray-300 bg-blue-50 hover:bg-blue-100'
      }`}
    >
      <div className="font-medium">{column.name}</div>
      <div className="text-xs text-gray-600">
        {column.width}% • {fieldsInColumn} field{fieldsInColumn !== 1 ? 's' : ''}
      </div>
      {isOver && (
        <div className="text-xs text-blue-600 mt-1">
          Drop field here
        </div>
      )}
    </div>
  );
}