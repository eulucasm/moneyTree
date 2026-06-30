export interface UserProfile {
  firstName: string;
  lastName: string;
  city: string;
  state: string;
  loginType: 'google' | 'email';
  password?: string;
  activePlan: 'free' | 'pro' | 'premium';
  createdAt?: string; // Format: "YYYY-MM"
  birthDate?: string;
  phone?: string;
  role?: 'admin' | 'user';
  status?: 'active' | 'suspended';
  email?: string;
}
