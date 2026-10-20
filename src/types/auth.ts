export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface Session {
  user: User;
}
