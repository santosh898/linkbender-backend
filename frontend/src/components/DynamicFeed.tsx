import React, { useState } from 'react';
import { MoreVertical, ChevronDown, ChevronUp, Tag } from 'lucide-react';
import { DynamicFeedProps, FeedItem } from '../types';

export const DynamicFeed: React.FC<DynamicFeedProps> = ({
  config,
  onConfigChange,
  onDragStart,
  onDrop
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set(config.selectedTags));

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const toggleExpand = (url: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(url)) {
      newExpanded.delete(url);
    } else {
      newExpanded.add(url);
    }
    setExpandedItems(newExpanded);
  };

  const handleTagSelect = (tag: string) => {
    const newTags = new Set(selectedTags);
    if (newTags.has(tag)) {
      newTags.delete(tag);
    } else {
      newTags.add(tag);
    }
    setSelectedTags(newTags);
    onConfigChange({
      ...config,
      selectedTags: Array.from(newTags)
    });
  };

  const filterItemsByTags = (items: FeedItem[]) => {
    if (selectedTags.size === 0) return items;
    return items.filter(item => 
      item.tags.some(tag => selectedTags.has(tag))
    );
  };

  const handleSort = (items: FeedItem[]) => {
    const filteredItems = filterItemsByTags(items);
    switch (config.sortBy) {
      case 'grade':
        return [...filteredItems].sort((a, b) => parseInt(b.grade) - parseInt(a.grade));
      case 'recent':
        return [...filteredItems].sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      case 'tags':
        return filteredItems;
      default:
        return filteredItems;
    }
  };

  // Get all unique tags from items
  const allTags = Array.from(new Set(
    config.items.flatMap(item => item.tags)
  ));

  const FeedItemCard: React.FC<{
    item: FeedItem;
    isExpanded: boolean;
    onToggle: () => void;
    onDragStart: () => void;
  }> = ({ item, isExpanded, onToggle, onDragStart }) => {
    const getBadgeStyle = (badge: string) => {
      switch (badge) {
        case 'gold':
          return 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20';
        case 'silver':
          return 'bg-gray-400/10 text-gray-400 border border-gray-400/20';
        case 'bronze':
          return 'bg-orange-700/10 text-orange-700 border border-orange-700/20';
        default:
          return 'bg-gray-700/10 text-gray-300 border border-gray-700/20';
      }
    };

    const getGradeColor = (grade: string) => {
      const numGrade = parseInt(grade);
      if (numGrade >= 8) return 'text-green-400';
      if (numGrade >= 6) return 'text-blue-400';
      if (numGrade >= 4) return 'text-yellow-400';
      return 'text-red-400';
    };

    return (
      <div
        draggable
        onDragStart={onDragStart}
        className="group bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 shadow-lg cursor-move 
                   hover:shadow-xl transition-all duration-300 hover:bg-gray-800 
                   border border-gray-700/50 hover:border-gray-600/50"
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex flex-col gap-1 flex-1">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors text-sm truncate max-w-[200px]"
            >
              {new URL(item.url).hostname}
            </a>
            {item.preferences && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">
                  {item.preferences.style === 'tenglish' ? 'Tenglish' : 'English'}
                </span>
                <span className="w-1 h-1 bg-gray-600 rounded-full" />
                <span className="text-xs text-gray-400">
                  {item.preferences.length}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${getGradeColor(item.grade)}`}>
              {item.grade}/10
            </span>
            {item.badge && (
              <span className={`px-2 py-1 rounded-full text-xs ${getBadgeStyle(item.badge)}`}>
                {item.badge}
              </span>
            )}
          </div>
        </div>

        <div className="relative">
          <p className={`text-gray-300 text-sm mb-3 transition-all duration-300
            ${isExpanded ? 'line-clamp-none' : 'line-clamp-3'}`}>
            {item.summary}
          </p>
          {!isExpanded && (
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t 
                           from-gray-800 to-transparent group-hover:from-gray-800" />
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {item.tags.map((tag, tagIndex) => (
              <span
                key={tagIndex}
                className="px-2 py-1 bg-gray-700/50 rounded-full text-xs text-gray-300
                       hover:bg-gray-600/50 transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
          <button
            onClick={onToggle}
            className="p-1 text-gray-400 hover:text-white transition-colors
                       hover:bg-gray-700/50 rounded-full"
          >
            {isExpanded ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </button>
        </div>

        {isExpanded && item.content && (
          <div className="mt-4 pt-4 border-t border-gray-700/50">
            <p className="text-sm text-gray-400">
              {item.content}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      className="flex-1 min-w-[300px] bg-gray-800/50 rounded-lg p-4 transition-all"
      onDragOver={handleDragOver}
      onDrop={() => onDrop(config.id)}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <input
            type="text"
            value={config.name}
            onChange={(e) => onConfigChange({ ...config, name: e.target.value })}
            className="bg-transparent font-semibold text-lg focus:outline-none focus:border-b border-gray-600"
          />
          <div className="flex items-center gap-2">
            <select
              value={config.sortBy}
              onChange={(e) => onConfigChange({ 
                ...config, 
                sortBy: e.target.value as typeof config.sortBy
              })}
              className="bg-gray-700 rounded-md px-2 py-1 text-sm"
            >
              <option value="recent">Recent</option>
              <option value="grade">Grade</option>
              <option value="tags">Tags</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagSelect(tag)}
              className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 transition-colors ${
                selectedTags.has(tag)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Tag size={12} />
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 h-[calc(100vh-250px)] overflow-y-auto mt-4">
        {handleSort(config.items).map((item, index) => (
          <FeedItemCard
            key={index}
            item={item}
            isExpanded={expandedItems.has(item.url)}
            onToggle={() => toggleExpand(item.url)}
            onDragStart={() => onDragStart(item)}
          />
        ))}
      </div>
    </div>
  );
}; 