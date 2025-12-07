import { Question, UserAnswer } from '../types';
import { generateDetailedExplanation } from './explanationGenerator';

export interface WrongNotesData {
    date: string;
    score: number;
    totalQuestions: number;
    percentage: number;
    timeSpentSeconds: number;
    wrongAnswers: UserAnswer[];
    getQuestion: (id: string) => Question | undefined;
}

export function generateWrongNotesHTML(data: WrongNotesData): string {
    const { date, score, totalQuestions, percentage, timeSpentSeconds, wrongAnswers, getQuestion } = data;
    const timeStr = `${Math.floor(timeSpentSeconds / 60)}分${timeSpentSeconds % 60}秒`;

    let questionsHTML = '';
    const topicErrors: Record<string, number> = {};

    wrongAnswers.forEach((answer, idx) => {
        const question = getQuestion(answer.questionId);
        if (!question) return;

        // Track topic errors
        question.topics.forEach(topic => {
            topicErrors[topic] = (topicErrors[topic] || 0) + 1;
        });

        const { whyWrong, conceptReview, optionBreakdown } = generateDetailedExplanation(
            question,
            answer.selectedIndex,
            question.correctIndex
        );

        let optionsHTML = '';
        question.options.forEach((opt, i) => {
            const letter = String.fromCharCode(65 + i);
            const isCorrect = i === question.correctIndex;
            const wasSelected = i === answer.selectedIndex;
            const explanation = optionBreakdown[i] || '';

            let optionClass = 'option';
            let icon = '';
            if (isCorrect) {
                optionClass += ' correct';
                icon = '✓';
            } else if (wasSelected) {
                optionClass += ' wrong';
                icon = '✗';
            }

            optionsHTML += `
                <div class="${optionClass}">
                    <div class="option-header">
                        <span class="option-letter">${letter}.</span>
                        <span class="option-text">${opt}</span>
                        ${icon ? `<span class="option-icon">${icon}</span>` : ''}
                    </div>
                    <div class="option-explanation">→ ${explanation}</div>
                </div>
            `;
        });

        questionsHTML += `
            <div class="question-card">
                <div class="question-number">❌ 錯題 ${idx + 1}</div>
                <div class="question-text">${question.text}</div>
                <div class="options-container">${optionsHTML}</div>
                <div class="analysis-section">
                    <h4>📌 為什麼錯</h4>
                    <p><strong>正確答案：</strong>${String.fromCharCode(65 + question.correctIndex)}</p>
                    <p><strong>您的選擇：</strong>${answer.selectedIndex !== null ? String.fromCharCode(65 + answer.selectedIndex) : '未作答'}</p>
                    ${whyWrong ? `<div class="why-wrong">${whyWrong.replace(/\*\*/g, '').replace(/\n/g, '<br>')}</div>` : ''}
                </div>
                <div class="concept-section">
                    <h4>📚 概念複習</h4>
                    <div class="concept-content">${conceptReview.replace(/\*\*/g, '<strong>').replace(/\*\*/g, '</strong>').replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</div>
                </div>
                ${question.topics?.length ? `<div class="tags">${question.topics.map(t => `<span class="tag">${t}</span>`).join('')}</div>` : ''}
            </div>
        `;
    });

    const sortedTopics = Object.entries(topicErrors).sort((a, b) => b[1] - a[1]);

    return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AWS MLA-C01 錯題筆記 - ${date}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: #e0e0e0;
            line-height: 1.7;
            min-height: 100vh;
        }
        .container { max-width: 900px; margin: 0 auto; padding: 40px 20px; }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding: 30px;
            background: rgba(255,255,255,0.05);
            border-radius: 16px;
            border: 1px solid rgba(255,255,255,0.1);
        }
        .header h1 { font-size: 2rem; color: #fff; margin-bottom: 20px; }
        .stats { display: flex; justify-content: center; gap: 30px; flex-wrap: wrap; }
        .stat { text-align: center; }
        .stat-value { font-size: 1.5rem; font-weight: bold; color: #7c3aed; }
        .stat-label { font-size: 0.9rem; color: #888; }
        
        .question-card {
            background: rgba(255,255,255,0.03);
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 24px;
            border: 1px solid rgba(255,255,255,0.08);
        }
        .question-number { font-size: 1.2rem; font-weight: bold; color: #ef4444; margin-bottom: 12px; }
        .question-text { font-size: 1.1rem; color: #fff; margin-bottom: 20px; font-style: italic; }
        
        .options-container { margin-bottom: 20px; }
        .option {
            padding: 12px 16px;
            margin: 8px 0;
            border-radius: 8px;
            background: rgba(255,255,255,0.02);
            border: 1px solid rgba(255,255,255,0.08);
        }
        .option.correct { background: rgba(34, 197, 94, 0.15); border-color: rgba(34, 197, 94, 0.4); }
        .option.wrong { background: rgba(239, 68, 68, 0.15); border-color: rgba(239, 68, 68, 0.4); }
        .option-header { display: flex; align-items: flex-start; gap: 8px; }
        .option-letter { font-weight: bold; color: #888; min-width: 24px; }
        .option-text { flex: 1; }
        .option-icon { font-weight: bold; margin-left: auto; }
        .option.correct .option-icon { color: #22c55e; }
        .option.wrong .option-icon { color: #ef4444; }
        .option-explanation { 
            margin-top: 8px; 
            padding-left: 32px; 
            font-size: 0.9rem; 
            color: #fbbf24; 
            font-style: italic;
        }
        
        .analysis-section, .concept-section {
            padding: 16px;
            margin: 16px 0;
            border-radius: 8px;
            background: rgba(124, 58, 237, 0.1);
            border-left: 3px solid #7c3aed;
        }
        .analysis-section h4, .concept-section h4 { color: #a78bfa; margin-bottom: 12px; }
        .why-wrong { margin-top: 12px; color: #fca5a5; }
        .concept-content p { margin: 8px 0; }
        
        .tags { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 16px; }
        .tag {
            background: rgba(59, 130, 246, 0.2);
            color: #60a5fa;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.85rem;
        }
        
        .summary {
            background: rgba(255,255,255,0.05);
            border-radius: 12px;
            padding: 24px;
            margin-top: 40px;
        }
        .summary h2 { color: #fff; margin-bottom: 20px; }
        .topic-item { 
            display: flex; 
            align-items: center; 
            padding: 8px 0; 
            border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .topic-name { flex: 1; }
        .topic-count { color: #ef4444; font-weight: bold; }
        
        .resources { margin-top: 24px; }
        .resources a { color: #60a5fa; text-decoration: none; display: block; padding: 8px 0; }
        .resources a:hover { text-decoration: underline; }
        
        @media print {
            body { background: white; color: black; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 AWS MLA-C01 錯題筆記</h1>
            <div class="stats">
                <div class="stat">
                    <div class="stat-value">📅 ${date}</div>
                    <div class="stat-label">日期</div>
                </div>
                <div class="stat">
                    <div class="stat-value">${score}/${totalQuestions}</div>
                    <div class="stat-label">成績 (${percentage}%)</div>
                </div>
                <div class="stat">
                    <div class="stat-value">⏱️ ${timeStr}</div>
                    <div class="stat-label">用時</div>
                </div>
                <div class="stat">
                    <div class="stat-value">❌ ${wrongAnswers.length}</div>
                    <div class="stat-label">錯題數</div>
                </div>
            </div>
        </div>

        ${questionsHTML}

        <div class="summary">
            <h2>🎯 複習重點總結</h2>
            ${sortedTopics.map(([topic, count]) => `
                <div class="topic-item">
                    <span class="topic-name">${topic}</span>
                    <span class="topic-count">錯誤 ${count} 題</span>
                </div>
            `).join('')}
            
            <div class="resources">
                <h3 style="margin: 20px 0 12px; color: #888;">📖 推薦學習資源</h3>
                <a href="https://docs.aws.amazon.com/sagemaker/" target="_blank">AWS SageMaker 官方文檔</a>
                <a href="https://aws.amazon.com/training/learn-about/machine-learning/" target="_blank">AWS ML Specialty 學習路徑</a>
                <a href="https://docs.aws.amazon.com/wellarchitected/latest/machine-learning-lens/" target="_blank">AWS Well-Architected ML Lens</a>
            </div>
        </div>
    </div>
</body>
</html>`;
}
