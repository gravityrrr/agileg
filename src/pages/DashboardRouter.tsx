import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import StudentDashboard from './StudentDashboard';
import InstructorDashboard from './InstructorDashboard';
import AdminDashboard from './AdminDashboard';

export default function DashboardRouter({ session }: { session: any }) {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRole() {
      // Typically, custom roles sync to profiles table or we use app_metadata
      // We will check the profiles table
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error("Error fetching user profile:", error);
          // Default fallback based on email for demo
          if (session.user.email?.includes('admin')) setRole('admin');
          else if (session.user.email?.includes('instructor')) setRole('instructor');
          else setRole('student');
        } else if (data) {
          setRole(data.role);
        }
      } catch (err) {
        console.error(err);
        setRole('student');
      } finally {
        setLoading(false);
      }
    }

    if (session?.user?.id) {
      fetchRole();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-mono text-accent animate-pulse-glow">CALIBRATING_NEURAL_LINK...</div>
      </div>
    );
  }

  return (
    <>
      {role === 'admin' && <AdminDashboard session={session} />}
      {role === 'instructor' && <InstructorDashboard session={session} />}
      {role === 'student' && <StudentDashboard session={session} />}
    </>
  );
}
