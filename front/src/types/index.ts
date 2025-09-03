export type UserType = 'student' | 'teacher' | 'coordinator';

export interface User {
  id: string;
  name: string;
  type: UserType;
  email: string;
}