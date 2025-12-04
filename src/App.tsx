import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ExamStart from './pages/ExamStart';
import ExamTake from './pages/ExamTake';
import ExamResult from './pages/ExamResult';
import History from './pages/History';
import Stats from './pages/Stats';
import PracticeWrong from './pages/PracticeWrong';

function App() {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/exam/start" element={<ExamStart />} />
                    <Route path="/exam/take" element={<ExamTake />} />
                    <Route path="/exam/result/:id" element={<ExamResult />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/stats" element={<Stats />} />
                    <Route path="/practice/wrong" element={<PracticeWrong />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;
