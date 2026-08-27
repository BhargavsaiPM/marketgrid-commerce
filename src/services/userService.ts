import type { UserDTO } from '../types/user.types';

const users: UserDTO[] = [
  { id: 'u1', name: 'Admin User', email: 'admin@example.com', role: 'admin' },
  { id: 'u2', name: 'Vendor User', email: 'vendor@example.com', role: 'vendor' },
  { id: 'u3', name: 'Customer User', email: 'customer@example.com', role: 'customer' }
];

const getLatency = () => Math.floor(Math.random() * 400) + 200;

export const userService = {
  getUsers: async (): Promise<UserDTO[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(users), getLatency());
    });
  },

  getUserById: async (id: string): Promise<UserDTO | undefined> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(users.find(u => u.id === id)), getLatency());
    });
  },

  subscribeToUsers: (callback: (users: UserDTO[]) => void, intervalMs: number = 5000) => {
    callback(users);
    const interval = setInterval(() => {
      callback(users);
    }, intervalMs);
    return () => clearInterval(interval);
  }
};
