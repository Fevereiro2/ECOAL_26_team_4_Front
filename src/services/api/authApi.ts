import { AuthForm, SignUpForm, User } from '../../types';
import { delay } from '../../utils/delay';
import { db } from './mockDb';

export const authApi = {
  async signIn(payload: AuthForm): Promise<User> {
    await delay(500);
    if (!payload.email || !payload.password) {
      throw new Error('Email and password are required.');
    }
    return db.getUser();
  },

  async signUp(payload: SignUpForm): Promise<User> {
    await delay(650);
    if (!payload.name || !payload.email || !payload.password) {
      throw new Error('Please fill all fields.');
    }
    return db.getUser();
  }
};
