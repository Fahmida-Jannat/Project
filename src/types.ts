// src/types.ts

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: any; // Firebase Timestamp
  type: 'income' | 'expense';
  userId: string;
}

export interface UserProfile {
  uid: string;
  username: string;
  fullName: string;
  email: string;
  birthdate: string;
}