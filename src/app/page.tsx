
'use client';

import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, 
  Users, 
  Settings, 
  Play, 
  Library, 
  LogOut,
  Shield,
  GraduationCap,
  User
} from 'lucide-react';

function Dashboard() {
  const { user, logout, hasRole } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.refresh();
  };

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'admin':
        return <Shield className="h-5 w-5 text-red-600" />;
      case 'teacher':
        return <GraduationCap className="h-5 w-5 text-blue-600" />;
      case 'student':
        return <User className="h-5 w-5 text-green-600" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };

  const getRoleBadgeColor = () => {
    switch (user?.role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'teacher':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'student':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quiz App Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user?.name}!</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {getRoleIcon()}
              <Badge className={getRoleBadgeColor()}>
                {user?.role?.toUpperCase()}
              </Badge>
            </div>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Play Games - Available to all */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/setup')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5 text-green-600" />
                Play Quiz
              </CardTitle>
              <CardDescription>
                Start a new quiz game with your team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                Start Game
              </Button>
            </CardContent>
          </Card>

          {/* Library - Available to all */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/library')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Library className="h-5 w-5 text-blue-600" />
                Content Library
              </CardTitle>
              <CardDescription>
                Browse topics and saved games
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Browse Library
              </Button>
            </CardContent>
          </Card>

          {/* Admin Panel - Admin and Teachers only */}
          {hasRole('admin') || hasRole('teacher') ? (
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-purple-600" />
                  Admin Panel
                </CardTitle>
                <CardDescription>
                  Manage content and questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Manage Content
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </div>

        {/* Role-specific Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Role: {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Unknown'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {user?.role === 'admin' && (
                  <div>
                    <p className="font-semibold text-red-600">Administrator Access</p>
                    <ul className="text-sm text-gray-600 mt-1 space-y-1">
                      <li>• Full access to all features</li>
                      <li>• Manage all content and users</li>
                      <li>• Create and edit questions</li>
                      <li>• Play all games</li>
                    </ul>
                  </div>
                )}
                {user?.role === 'teacher' && (
                  <div>
                    <p className="font-semibold text-blue-600">Teacher Access</p>
                    <ul className="text-sm text-gray-600 mt-1 space-y-1">
                      <li>• Create and manage content</li>
                      <li>• Add questions and topics</li>
                      <li>• Host quiz games</li>
                      <li>• Access admin panel</li>
                    </ul>
                  </div>
                )}
                {user?.role === 'student' && (
                  <div>
                    <p className="font-semibold text-green-600">Student Access</p>
                    <ul className="text-sm text-gray-600 mt-1 space-y-1">
                      <li>• Play quiz games</li>
                      <li>• Browse content library</li>
                      <li>• View saved games</li>
                      <li>• Join team games</li>
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Start</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  New to the quiz app? Here's how to get started:
                </p>
                <ol className="text-sm text-gray-600 space-y-1">
                  <li>1. Browse the content library to see available topics</li>
                  <li>2. Click "Play Quiz" to start a new game</li>
                  <li>3. Set up your teams and game settings</li>
                  <li>4. Enjoy the interactive quiz experience!</li>
                </ol>
                {(hasRole('admin') || hasRole('teacher')) && (
                  <p className="text-sm text-blue-600 mt-3">
                    💡 As a {user?.role}, you can also create new content in the Admin Panel.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}
