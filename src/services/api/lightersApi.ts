import { Lighter, LighterFormValues } from '../../types';
import { delay } from '../../utils/delay';
import { db } from './mockDb';

const toLighter = (id: string, values: LighterFormValues): Lighter => ({
  id,
  name: values.name,
  description: values.description,
  image: values.image,
  isPublic: values.isPublic,
  categories: values.categories,
  criteria: values.criteria,
  notes: values.notes,
  createdAt: new Date().toISOString().slice(0, 10)
});

export const lightersApi = {
  async getAll() {
    await delay();
    return db.getLighters();
  },

  async getById(id: string) {
    await delay(220);
    return db.getLighterById(id);
  },

  async create(payload: LighterFormValues) {
    await delay(280);
    const next = toLighter(`l-${Date.now()}`, payload);
    db.setLighters([next, ...db.getLighters()]);
    return next;
  },

  async update(id: string, payload: LighterFormValues) {
    await delay(280);
    const current = db.getLighterById(id);
    if (!current) return null;

    const updated: Lighter = {
      ...current,
      ...payload,
      criteria: payload.criteria,
      categories: payload.categories
    };

    db.setLighters(db.getLighters().map((item) => (item.id === id ? updated : item)));
    return updated;
  },

  async remove(id: string) {
    await delay(220);
    db.setLighters(db.getLighters().filter((item) => item.id !== id));
    return true;
  }
};
