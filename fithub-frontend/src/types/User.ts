export interface MemberDetails {
  age?: number | string;
  gender?: string;
  height?: number | string;
  weight?: number | string;
  goal?: string;
  membershipType?: string | number;
  phone?: string;
  dateOfBirth?: string;
}

export interface User {
  id: number;
  name: string; // Full name from backend
  email: string;
  role: string;
  memberDetails?: MemberDetails;
  dateOfBirth?: string; // Added to match EditUserModal usage
  createdAt?: string; // ISO date string, for growth stats
}
