export interface UserDTO {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'vendor' | 'admin';
}

export interface AuthSessionDTO {
  user: UserDTO;
  jwt: string;
  activeTenantId: string | null;
}
