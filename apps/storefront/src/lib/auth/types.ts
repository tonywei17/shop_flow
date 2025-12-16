export type PriceType = "hq" | "branch" | "classroom" | "retail";

export type StorefrontUser = {
  id: string;
  accountId: string;
  displayName: string;
  email: string | null;
  phone?: string | null;
  departmentId: string | null;
  departmentName: string | null;
  roleId: string | null;
  roleCode: string | null;
  priceType: PriceType;
};

export type AuthSession = {
  user: StorefrontUser;
  expiresAt: number;
};

export type LoginCredentials = {
  accountId: string;
  password: string;
};

export type LoginResult = {
  success: boolean;
  error?: string;
  user?: StorefrontUser;
};
