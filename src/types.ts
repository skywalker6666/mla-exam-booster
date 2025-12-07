export type QuestionTopic =
    | 'STORAGE'
    | 'DATA_TRANSFER'
    | 'EVAL'
    | 'XGBOOST'
    | 'SAGEMAKER'
    | 'ML_OPS'
    | 'SECURITY_COST'
    | 'PAST_EXAM';

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export type Question = {
    id: string;
    text: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
    topics: QuestionTopic[];
    difficulty?: Difficulty;
    isPastExam?: boolean;
    optionExplanations?: string[];
};

export type UserAnswer = {
    questionId: string;
    selectedIndex: number | null;
    isCorrect: boolean;
};

export type ExamSession = {
    id: string;
    startedAt: string;
    finishedAt: string | null;
    questionIds: string[];
    answers: UserAnswer[];
    totalScore: number;
    totalQuestions: number;
    durationSeconds: number; // Duration of the exam in seconds
    timeSpentSeconds: number; // Actual time spent
    isPastExam?: boolean;
};

export type ExamHistoryItem = {
    id: string;
    date: string;
    score: number;
    totalQuestions: number;
    timeSpentSeconds: number;
};
