import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { ThemeProvider } from './lib/ThemeContext';
import Login from './pages/Login';
import DashboardRouter from './pages/DashboardRouter';

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-mono text-accent animate-pulse-glow">INITIALIZING_SYSTEM...</div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route 
            path="/" 
            element={!session ? <Login /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/dashboard/*" 
            element={session ? <DashboardRouter session={session} /> : <Navigate to="/" />} 
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
