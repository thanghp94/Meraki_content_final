'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { type UserRole } from '@/lib/authService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { LogIn, User, GraduationCap, Shield } from 'lucide-react';

interface LoginFormProps {
  onLoginSuccess?: () => void;
}

const getRoleIcon = (role: UserRole) => {
  switch (role) {
    case 'admin':
      return <Shield className="h-4 w-4" />;
    case 'teacher':
      return <GraduationCap className="h-4 w-4" />;
    case 'student':
      return <User className="h-4 w-4" />;
    default:
      return <User className="h-4 w-4" />;
  }
};

const getRoleColor = (role: UserRole) => {
  switch (role) {
    case 'admin':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'teacher':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'student':
      return 'text-green-600 bg-green-50 border-green-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await login(username, password);
      
      if (result.success) {
        toast({
          title: 'Login Successful!',
          description: `Welcome back!`,
        });
        onLoginSuccess?.();
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demoUsername: string, demoPassword: string) => {
    setUsername(demoUsername);
    setPassword(demoPassword);
    setIsLoading(true);
    
    try {
      const result = await login(demoUsername, demoPassword);
      if (result.success) {
        toast({
          title: 'Demo Login Successful!',
          description: `Logged in as ${demoUsername}`,
        });
        onLoginSuccess?.();
      } else {
        setError(result.error || 'Demo login failed');
      }
    } catch (err) {
      setError('Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const demoAccounts = [
    { username: 'admin', password: 'admin123', role: 'admin' as UserRole, name: 'System Administrator' },
    { username: 'teacher1', password: 'teacher123', role: 'teacher' as UserRole, name: 'Ms. Johnson' },
    { username: 'student1', password: 'student123', role: 'student' as UserRole, name: 'Alice Cooper' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <LogIn className="h-6 w-6" />
            Quiz App Login
          </CardTitle>
          <CardDescription>
            Sign in to access the quiz application
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <div className="w-full">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setShowDemoAccounts(!showDemoAccounts)}
            >
              {showDemoAccounts ? 'Hide' : 'Show'} Demo Accounts
            </Button>
          </div>

          {showDemoAccounts && (
            <div className="w-full space-y-2">
              <p className="text-sm text-muted-foreground text-center">
                Click any demo account to login:
              </p>
              {demoAccounts.map((account) => (
                <Button
                  key={account.username}
                  type="button"
                  variant="outline"
                  className={`w-full justify-start text-left ${getRoleColor(account.role)}`}
                  onClick={() => handleDemoLogin(account.username, account.password)}
                >
                  <div className="flex items-center gap-2">
                    {getRoleIcon(account.role)}
                    <div className="flex-1">
                      <div className="font-medium">{account.name}</div>
                      <div className="text-xs opacity-70">
                        {account.username} • {account.role}
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
