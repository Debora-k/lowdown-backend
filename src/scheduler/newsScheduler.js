import dotenv from 'dotenv';
import axios from 'axios';
import Article from '../models/Article.js';
import { NEWS_DOMAINS } from '../utils/domains.js';
dotenv.config();

const API_KEY = process.env.NEWS_API_KEY;

export const newsScheduler = async () => {
  const categoryList = [
    'business',
    'entertainment',
    'general',
    'health',
    'science',
    'sports',
    'technology',
  ];
  const URL = 'https://newsapi.org/v2/everything';

  let fromDateObj = new Date();
  fromDateObj.setDate(fromDateObj.getDate() - 2);
  let from = fromDateObj.toISOString();

  let to = new Date().toISOString();

  const articleCount = await Article.countDocuments();

  if (articleCount > 1000) return;

  for (let i = 0; i < categoryList.length; i++) {
    const category = categoryList[i];

    const existingArticles = await Article.find({});

    const response = await axios.get(URL, {
      params: {
        apiKey: API_KEY,
        q: category,
        domains: NEWS_DOMAINS,
        from,
        to,
        sortBy: 'relevancy',
      },
    });

    const filterArticles = response.data.articles.filter((article) => {
      for (let i = 0; i < existingArticles.length; i++) {
        if (article.title === existingArticles[i].title) return false;
      }
      return true;
    });

    await Article.insertMany(
      filterArticles.map((article) => {
        return {
          source: article.source,
          title: article.title,
          content: article.content,
          summary: article.description,
          deleteFlag: true,
          publishedAt: article.publishedAt,
          category: category,
          url: article.url,
          urlToImage: article.urlToImage,
          comments: [],
        };
      })
    );
  }
};
