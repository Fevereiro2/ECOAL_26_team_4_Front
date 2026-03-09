import { delay } from '../../utils/delay';
import { db } from './mockDb';

export const metaApi = {
  async getUser() {
    await delay(150);
    return db.getUser();
  },

  async getCollection() {
    await delay(150);
    return db.getCollection();
  },

  async getCategories() {
    await delay(150);
    return db.getCategories();
  }
};
