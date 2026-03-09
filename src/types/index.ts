export type CriteriaKey = 'weight' | 'temperature' | 'ignition' | 'year';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  collectionId: string;
}

export interface Collection {
  id: string;
  userId: string;
  title: string;
  description: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface CriteriaDefinition {
  key: CriteriaKey;
  label: string;
  unit: string;
}

export interface LighterCriteria {
  weight: number;
  temperature: number;
  ignition: number;
  year: number;
}

export interface Lighter {
  id: string;
  name: string;
  description: string;
  image: string;
  isPublic: boolean;
  categories: string[];
  criteria: LighterCriteria;
  notes: string;
  createdAt: string;
}

export interface AuthForm {
  email: string;
  password: string;
}

export interface SignUpForm extends AuthForm {
  name: string;
  confirmPassword: string;
}

export interface LighterFormValues {
  name: string;
  description: string;
  image: string;
  isPublic: boolean;
  categories: string[];
  criteria: LighterCriteria;
  notes: string;
}

export type LighterSortKey = 'name' | 'weight' | 'temperature' | 'ignition' | 'year';

export interface SelectOption {
  label: string;
  value: string;
}
