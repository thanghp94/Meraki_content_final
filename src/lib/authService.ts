export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  name: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

// Mock users for development
const MOCK_USERS: User[] = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: 'System Administrator',
    email: 'admin@school.edu'
  },
  {
    id: '2',
    username: 'teacher1',
    password: 'teacher123',
    role: 'teacher',
    name: 'Ms. Johnson',
    email: 'johnson@school.edu'
  },
  {
    id: '3',
    username: 'teacher2',
    password: 'teacher123',
    role: 'teacher',
    name: 'Mr. Smith',
    email: 'smith@school.edu'
  },
  {
    id: '4',
    username: 'student1',
    password: 'student123',
    role: 'student',
    name: 'Alice Cooper',
    email: 'alice@school.edu'
  },
  {
    id: '5',
    username: 'student2',
    password: 'student123',
    role: 'student',
    name: 'Bob Wilson',
    email: 'bob@school.edu'
  }
];

class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;

  private constructor() {
    // Load user from localStorage on initialization
    this.loadUserFromStorage();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private loadUserFromStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const storedUser = localStorage.getItem('quiz_auth_user');
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
      this.logout();
    }
  }

  private saveUserToStorage(user: User): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('quiz_auth_user', JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user to storage:', error);
    }
  }

  public login(username: string, password: string): { success: boolean; user?: User; error?: string } {
    const user = MOCK_USERS.find(u => u.username === username && u.password === password);
    
    if (user) {
      this.currentUser = user;
      this.saveUserToStorage(user);
      return { success: true, user };
    }
    
    return { success: false, error: 'Invalid username or password' };
  }

  public logout(): void {
    this.currentUser = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('quiz_auth_user');
    }
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  public hasRole(role: UserRole): boolean {
    return this.currentUser?.role === role;
  }

  public hasAnyRole(roles: UserRole[]): boolean {
    return this.currentUser ? roles.includes(this.currentUser.role) : false;
  }

  public canAccessAdmin(): boolean {
    return this.hasAnyRole(['admin', 'teacher']);
  }

  public canCreateContent(): boolean {
    return this.hasAnyRole(['admin', 'teacher']);
  }

  public canPlayGames(): boolean {
    return this.hasAnyRole(['admin', 'teacher', 'student']);
  }

  public getUserStorageKey(baseKey: string): string {
    const userId = this.currentUser?.id || 'anonymous';
    return `${baseKey}_${userId}`;
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
