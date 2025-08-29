// MongoDB User model removed - using Supabase for user management
// All user operations are now handled through Supabase auth tables

export interface IUser {
  id: string;
  email: string;
  name: string;
  role: string;
  isPremium: boolean;
}

// Legacy export for compatibility
export const User = null;
export default null;
