import { useState } from 'react';
import Layout from '../components/Layout';
import InstructorHome from './instructor/InstructorHome';
import AssessmentsPage from './instructor/AssessmentsPage';
import CoursesPage from './instructor/CoursesPage';
import AnalyticsPage from './instructor/AnalyticsPage';
import ArchivePage from './instructor/ArchivePage';

export default function InstructorDashboard({ session }: { session: any }) {
  const [activePage, setActivePage] = useState('dashboard');
  const userName = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || 'INSTRUCTOR';

  const renderPage = () => {
    switch (activePage) {
      case 'assessments': return <AssessmentsPage session={session} />;
      case 'courses': return <CoursesPage session={session} />;
      case 'analytics': return <AnalyticsPage session={session} />;
      case 'archive': return <ArchivePage />;
      default: return <InstructorHome session={session} onNavigate={setActivePage} />;
    }
  };

  return (
    <Layout userRole="instructor" userName={userName} activePage={activePage} onNavigate={setActivePage}>
      {renderPage()}
    </Layout>
  );
}
