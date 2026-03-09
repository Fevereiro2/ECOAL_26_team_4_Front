import { Collection, User } from '../types';

export const currentUser: User = {
  id: 'user-1',
  name: 'Alex Ferreira',
  email: 'alex.ferreira@uni.edu',
  avatar:
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  collectionId: 'collection-1'
};

export const currentCollection: Collection = {
  id: 'collection-1',
  userId: 'user-1',
  title: 'Alex\'s Isqueiros Vault',
  description:
    'A curated showcase of iconic and modern lighters, focused on craftsmanship, reliability, and collectible value.'
};
