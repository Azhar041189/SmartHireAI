import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { CreateJob } from './pages/CreateJob';
import { AddCandidate } from './pages/AddCandidate';
import { CandidateDetail } from './pages/CandidateDetail';
import { JobDetail } from './pages/JobDetail';
import { SourcingHub } from './pages/SourcingHub';
import { Settings } from './pages/Settings';

function App() {
  return (
    <ThemeProvider>
      <StoreProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="create-job" element={<CreateJob />} />
              <Route path="add-candidate" element={<AddCandidate />} />
              <Route path="candidates/:id" element={<CandidateDetail />} />
              <Route path="jobs/:id" element={<JobDetail />} />
              <Route path="sourcing" element={<SourcingHub />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </HashRouter>
      </StoreProvider>
    </ThemeProvider>
  );
}

export default App;