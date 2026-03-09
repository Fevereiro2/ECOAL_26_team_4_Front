import { Lighter, LighterSortKey } from '../types';

export const sortLighters = (items: Lighter[], sortKey: LighterSortKey): Lighter[] => {
  const copy = [...items];

  if (sortKey === 'name') {
    return copy.sort((a, b) => a.name.localeCompare(b.name));
  }

  return copy.sort((a, b) => b.criteria[sortKey] - a.criteria[sortKey]);
};

export const matchesQuery = (name: string, query: string): boolean => {
  if (!query.trim()) return true;
  return name.toLowerCase().includes(query.trim().toLowerCase());
};

export const formatCriterionValue = (key: keyof Lighter['criteria'], value: number): string => {
  if (key === 'temperature') return `${value}°C`;
  if (key === 'weight') return `${value} g`;
  if (key === 'ignition') return `${value} uses`;
  return `${value}`;
};
