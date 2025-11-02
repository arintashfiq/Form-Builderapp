import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { FormField } from '../types';

interface DragDropFieldProps {
  field: FormField;
  index: number;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  children: React.ReactNode;
}

export default function DragDropField({ field, index, onMove, children }: DragDropFieldProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'field',
    item: { id: field.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'field',
    hover: (item: { id: string; index: number }) => {
      if (item.index !== index) {
        onMove(item.index, index);
        item.index = index;
      }
    },
  });

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`form-field ${isDragging ? 'opacity-50' : ''}`}
      style={{ cursor: 'move' }}
    >
      {children}
    </div>
  );
}