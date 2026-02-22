import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

export interface Article {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

interface ArticleStore {
  articles: Article[];
  addArticle: (title: string, content: string) => void;
  removeArticle: (id: string) => void;
  clearArticles: () => void;
}

export const useArticleStore = create<ArticleStore>((set) => ({
  articles: [],

  addArticle: (title: string, content: string) => {
    const newArticle: Article = {
      id: uuidv4(),
      title: title.trim(),
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      articles: [...state.articles, newArticle],
    }));
  },

  removeArticle: (id: string) => {
    set((state) => ({
      articles: state.articles.filter((article) => article.id !== id),
    }));
  },

  clearArticles: () => {
    set({ articles: [] });
  },
}));
