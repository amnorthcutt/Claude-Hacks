import React from 'react';
import { EventCategory, CATEGORY_COLORS } from '../types';

interface FilterBarProps {
  selectedCategory: EventCategory | 'all';
  onCategoryChange: (category: EventCategory | 'all') => void;
}

export function FilterBar({ selectedCategory, onCategoryChange }: FilterBarProps) {
  const categories: Array<EventCategory | 'all'> = [
    'all',
    'sports',
    'academic',
    'social',
    'arts',
    'food',
    'other'
  ];

  return (
    <div className="filter-bar">
      {categories.map(category => {
        const isActive = selectedCategory === category;
        const config = category === 'all'
          ? { label: 'All Events', color: '#000000' }
          : CATEGORY_COLORS[category];

        return (
          <button
            key={category}
            className={`filter-button ${isActive ? 'active' : ''}`}
            onClick={() => onCategoryChange(category)}
            style={{
              backgroundColor: isActive ? config.color : 'transparent',
              borderColor: config.color,
              color: isActive ? '#ffffff' : config.color
            }}
          >
            {config.label}
          </button>
        );
      })}
    </div>
  );
}
