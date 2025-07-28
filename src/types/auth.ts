// src/types/auth.ts

export type UserStatus = 'TRIAL' | 'NEW' | 'ACTIVE' | 'EXPIRED' | 'INACTIVE';
export type AccountStatus = 'TRIAL' | 'ACTIVE' | 'PENDING_PAYMENT' | 'EXPIRED';
export type UserRole = 'PRIMARY' | 'PARTNER' | 'FINANCE';
export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  error?: ApiError;
  user?: User;
  isAdmin?: boolean;
}

export interface ApiError {
  message: string;
  details?: string;
  code?: string;
  user?: User;
}


export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isTrialUser: boolean;
  activeRole: "PRIMARY" | "PARTNER" | "FINANCE" | null;
  householdStatus: AccountStatus | null;
  taxYear: number | null;
  businessPercentage: number | null;
  totalTransactions: number | null;
  isAdmin: boolean;
  canInviteUsers: boolean;
  requiresPayment: boolean;
  isExpired: boolean;
  canUpload: boolean;  
  login: (redirect?: string) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}


export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  quilttSession?: string;
  user?: User;
}

export interface User {
  id: string;
  email: string;
  name: string;
  first_name?: string;
  last_name?: string;
  status: UserStatus;
  role: UserRole;
  phone: string | null;
  picture?: string | null;
  isAdmin: boolean;
  household_primary?: Household;
  household_partner?: Household;
  household_finance?: Household;
  updatedAt?: string;
  terms?: string;
  sentInvitations?: Invitation[];
}

export interface Household {
  id: number;
  accountStatus: AccountStatus;
  label: string;
  taxYear: number;
  totalTransactions: number;
  businessPercentage: number;
  updatedAt?: string;
  primary_user: HouseholdUser;
  partner_user: HouseholdUser;
  finance_user: HouseholdUser;
}

export interface HouseholdUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isAdmin?: boolean;
  status?: UserStatus;
  updatedAt?: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

export interface SignInResponse extends AuthResponse {
  error?: {
    message: string;
  };
}

export interface GoogleSignInData {
  credential: string;
}

export interface GoogleSignInResponse {
  status: number | 'success';
  message?: string;
  accessToken: string;
  refreshToken: string;
  quilttSession?: string;
  data?: {
    accessToken: string;
    refreshToken: string;
    quilttSession?: string;
    message?: string;
  };
  error?: {
    message: string;
  };
}

export interface SignupData {
  invitation_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
}

export interface SignUpResponse {
  status: number | 'success';
  message?: string;
  accessToken: string;
  refreshToken: string;
  quilttSession?: string;
  data?: {
    accessToken: string;
    refreshToken: string;
    quilttSession?: string;
    message?: string;
  };
  error?: {
    message: string;
  };
}

export interface InvitationData {
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
}

export interface Invitation {
  id: number;
  email: string;
  status: InvitationStatus;
  inviterId: number;
  inviteeId?: number;
  role: UserRole;
  name: string;
  first_name: string;
  last_name: string;
  updatedAt: string;
  createdAt: string;
  inviteeEmail: string;
  householdId: number;
  isExpired?: boolean;
  InvitationStatus?: InvitationStatus;
  inviter?: InvitationUser;
  invitee?: InvitationUser;
}

export interface InvitationDetailsResponse {
  id: number;
  email: string;
  status: InvitationStatus;
  inviterId: number;
  inviteeId?: number;
  role: UserRole;
  name: string;
  first_name: string;
  last_name: string;
  updatedAt: string;
  household: {
    label: string;
  };
  inviter?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    name?: string;
  };
  invitee?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    name?: string;
  };
}

export interface InvitationUser {
  id: number;
  email: string;
  name?: string;
  updatedAt?: string;
}

export interface InvitationsResponse {
  sentInvitations: Invitation[];
  receivedInvitations: Invitation[];
}

export interface MembersResponse {
  id: number;
  email: string;
  role: UserRole;
}

export interface SharedUser {
  id: number;
  email: string;
  name?: string;
}

export interface HouseholdsResponse extends Omit<Household, 'primary_user' | 'partner_user' | 'finance_user'> {
  primary_user: HouseholdUser & {
    userNotExist?: boolean;
    first_name?: string;
    last_name?: string;
  };
  partner_user: HouseholdUser & {
    userNotExist?: boolean;
    first_name?: string;
    last_name?: string;
  };
  finance_user: HouseholdUser & {
    userNotExist?: boolean;
    first_name?: string;
    last_name?: string;
  };
}

export interface DeleteUserResponse {
  status: 'success' | 'error';
  message?: string;
}