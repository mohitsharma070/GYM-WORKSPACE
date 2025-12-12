export interface MemberDetails {
  age?: number | string;
  gender?: string;
  height?: number | string;
  weight?: number | string;
  goal?: string;
  membershipType?: string | number;
  phone?: string;
}

export interface User {
  id: number;
  name: string; // Full name from backend
  email: string;
  role: string;
  memberDetails?: MemberDetails;
}
