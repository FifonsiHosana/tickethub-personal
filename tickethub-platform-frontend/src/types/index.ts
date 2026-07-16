export type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  passwordHash: string | null;
  isVerified: boolean;
  isActive: boolean | null;
  profileImage: string | null;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
};
