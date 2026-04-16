import { useState } from 'react';
import Layout from '../components/Layout';
import AdminHome from './admin/AdminHome';
import AdminRoles from './admin/AdminRoles';
import AdminAnalytics from './admin/AdminAnalytics';

export default function AdminDashboard({ session }: { session: any }) {
  const [activePage, setActivePage] = useState('dashboard');
  const userName = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || 'ADMIN';

  const renderPage = () => {
    switch (activePage) {
      case 'roles': return <AdminRoles session={session} />;
      case 'analytics': return <AdminAnalytics session={session} />;
      default: return <AdminHome session={session} onNavigate={setActivePage} />;
    }
  };

  return (
    <Layout userRole="admin" userName={userName} activePage={activePage} onNavigate={setActivePage}>
      {renderPage()}
    </Layout>
  );
}
