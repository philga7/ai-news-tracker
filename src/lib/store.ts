import { create } from 'zustand';
import { createClient } from '@supabase/supabase-js';
// import OpenAI from 'openai';

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

// Initialize OpenAI client
// const openai = new OpenAI({
//   apiKey: import.meta.env.VITE_OPENAI_API_KEY,
//   dangerouslyAllowBrowser: true
// });

interface NewsArticle {
  id: number;
  title: string;
  source: string;
  timestamp: Date;
  category: string;
  // importance: 'high' | 'medium' | 'low'; // OpenAI lines (3)
  // summary: string;
  // sentiment?: 'positive' | 'negative' | 'neutral';
  url: string;
  original_url?: string;  // Add this for CFP articles
  is_cfp?: boolean;      // Add this to identify CFP articles
}

interface CFPArticle {
  title: string;
  url: string;
  original_url: string | null;
  timestamp: Date;
  source: string;
}

interface Topic {
  topic: string;
  count: number;
  sentiment: 'positive' | 'negative' | 'neutral';
}

interface NewsStore {
  articles: NewsArticle[];
  topics: Topic[];
  cfpArticles: CFPArticle[];
  isLoadingCFP: boolean;
  fetchCFPNews: () => Promise<void>;
  // dailySummary: string; // OpenAI
  alerts: string[];
  userPreferences: {
    categories: string[];
    sources: string[];
    alertFrequency: 'high' | 'medium' | 'low';
  };
  isLoading: boolean;
  error: string | null;
  fetchLatestNews: () => Promise<void>;
  // generateDailySummary: () => Promise<void>; // OpenAI (2)
  // analyzeSentiment: (text: string) => Promise<string>;
  updateUserPreferences: (preferences: Partial<NewsStore['userPreferences']>) => Promise<void>;
  addAlert: (alert: string) => void;
  clearAlerts: () => void;
}

export const useNewsStore = create<NewsStore>((set, get) => ({
  articles: [],
  topics: [],
  cfpArticles: [],
  isLoadingCFP: false,
  dailySummary: '',
  alerts: [],
  userPreferences: {
    categories: ['Technology', 'Finance', 'Environment'],
    sources: ['Tech Daily', 'Financial Times', 'Green News'],
    alertFrequency: 'medium',
  },
  isLoading: false,
  error: null,

  // Add new CFP fetch function
  fetchCFPNews: async () => {
    try {
      set({ isLoadingCFP: true });
      
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('is_cfp', true)
        .order('timestamp', { ascending: false })
        .limit(20);
  
      if (error) throw error;
  
      const cfpArticles = data.map(article => ({
        title: article.title,
        url: article.url,
        original_url: article.original_url,
        timestamp: new Date(article.timestamp),
        source: article.source
      }));
  
      set({ 
        cfpArticles,
        isLoadingCFP: false 
      });
    } catch (error) {
      console.error('Error fetching CFP news:', error);
      set({ 
        error: (error as Error).message, 
        isLoadingCFP: false 
      });
    }
  },

  // Modify existing fetchLatestNews to include CFP articles
  fetchLatestNews: async () => {
    try {
      set({ isLoading: true });
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Simplified mapping without AI processing
      const processedArticles = data.map(article => ({
        ...article,
        timestamp: new Date(article.timestamp)
      }));

      set({ articles: processedArticles, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // generateDailySummary: async () => { // OpenAI function
  //   try {
  //     const { articles } = get();
  //     const articleTexts = articles
  //       .map(a => `${a.title}: ${a.summary}`)
  //       .join('\n');

  //     const completion = await openai.chat.completions.create({
  //       messages: [{
  //         role: 'system',
  //         content: 'You are a professional news analyst. Create a concise summary of today\'s key news stories.'
  //       }, {
  //         role: 'user',
  //         content: `Summarize these news stories:\n${articleTexts}`
  //       }],
  //       model: 'gpt-4-turbo-preview',
  //     });

  //     const summary = completion.choices[0]?.message?.content || '';
  //     set({ dailySummary: summary });
  //   } catch (error) {
  //     set({ error: (error as Error).message });
  //   }
  // },

  // analyzeSentiment: async (text: string) => { // OpenAI function
  //   try {
  //     const completion = await openai.chat.completions.create({
  //       messages: [{
  //         role: 'system',
  //         content: 'Analyze the sentiment of the following text and respond with only "positive", "negative", or "neutral".'
  //       }, {
  //         role: 'user',
  //         content: text
  //       }],
  //       model: 'gpt-4-turbo-preview',
  //     });

  //     return completion.choices[0]?.message?.content || 'neutral';
  //   } catch (error) {
  //     console.error('Sentiment analysis error:', error);
  //     return 'neutral';
  //   }
  // },

  updateUserPreferences: async (preferences) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
        });

      if (error) throw error;

      set(state => ({
        userPreferences: {
          ...state.userPreferences,
          ...preferences,
        },
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  addAlert: (alert) => {
    set(state => ({
      alerts: [...state.alerts, alert].slice(-5),
    }));
  },

  clearAlerts: () => {
    set({ alerts: [] });
  },
}));
