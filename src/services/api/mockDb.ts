import { categories } from '../../data/categories';
import { currentCollection, currentUser } from '../../data/user';
import { lightersSeed } from '../../data/lighters';
import { Category, Collection, Lighter, User } from '../../types';

let lighters: Lighter[] = [...lightersSeed];
let user: User = { ...currentUser };
let collection: Collection = { ...currentCollection };

export const db = {
  getUser: () => ({ ...user }),
  getCollection: () => ({ ...collection }),
  getCategories: (): Category[] => [...categories],
  getLighters: (): Lighter[] => [...lighters],
  getLighterById: (id: string): Lighter | undefined => lighters.find((item) => item.id === id),
  setLighters: (next: Lighter[]) => {
    lighters = next;
  }
};
