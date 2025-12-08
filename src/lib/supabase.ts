import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helper functions
export const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });
    return { data, error };
};

export const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    return { data, error };
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
};

export const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
};

// Database helper functions
export const saveExamSession = async (session: {
    examType: string;
    score: number;
    total: number;
    answers: Record<string, unknown>;
    questions: unknown[];
}) => {
    const user = await getCurrentUser();
    if (!user) return { error: new Error('Not authenticated') };

    const { data, error } = await supabase
        .from('exam_sessions')
        .insert({
            user_id: user.id,
            exam_type: session.examType,
            score: session.score,
            total: session.total,
            answers: session.answers,
            questions: session.questions,
        })
        .select()
        .single();

    return { data, error };
};

export const getExamHistory = async () => {
    const user = await getCurrentUser();
    if (!user) return { data: [], error: null };

    const { data, error } = await supabase
        .from('exam_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

    return { data: data || [], error };
};

export const saveProgress = async (questionId: string, isCorrect: boolean, selectedIndex?: number, selectedIndices?: number[]) => {
    const user = await getCurrentUser();
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
        .from('exam_progress')
        .insert({
            user_id: user.id,
            question_id: questionId,
            is_correct: isCorrect,
            selected_index: selectedIndex,
            selected_indices: selectedIndices,
        });

    return { error };
};
