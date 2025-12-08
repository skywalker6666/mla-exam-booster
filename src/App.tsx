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
import Login from './pages/Login';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/*" element={
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
                } />
            </Routes>
        </Router>
    );
}

export default App;

