import { CriteriaDefinition } from '@/types';

export const CRITERIA_DEFINITIONS: CriteriaDefinition[] = [
  { key: 'weight', label: 'Weight', unit: 'g' },
  { key: 'temperature', label: 'Flame Temperature', unit: '°C' },
  { key: 'ignition', label: 'Ignition Capacity', unit: 'uses' },
  { key: 'year', label: 'Year', unit: '' }
];

export const SORT_OPTIONS = [
  { label: 'Name', value: 'name' },
  { label: 'Weight', value: 'weight' },
  { label: 'Temperature', value: 'temperature' },
  { label: 'Ignition', value: 'ignition' },
  { label: 'Year', value: 'year' }
] as const;
