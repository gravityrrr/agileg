import { useState } from 'react';
import Layout from '../components/Layout';
import StudentHome from './student/StudentHome';
import StudentAssessments from './student/StudentAssessments';
import StudentAnalytics from './student/StudentAnalytics';

export default function StudentDashboard({ session }: { session: any }) {
  const [activePage, setActivePage] = useState('dashboard');
  const userName = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || 'STUDENT';

  const renderPage = () => {
    switch (activePage) {
      case 'assessments': return <StudentAssessments session={session} />;
      case 'analytics': return <StudentAnalytics session={session} />;
      default: return <StudentHome session={session} onNavigate={setActivePage} />;
    }
  };

  return (
    <Layout userRole="student" userName={userName} activePage={activePage} onNavigate={setActivePage}>
      {renderPage()}
    </Layout>
  );
}
