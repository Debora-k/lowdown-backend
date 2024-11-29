import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();

const API_KEY = process.env.NEWS_API_KEY;

export const newsAPI_Everything = async (req, res) => {
  try {
    let from = '2024-11-11';
    let to = '2024-11-13';
    const URL = 'https://newsapi.org/v2/everything';

    const response = await axios.get(URL, {
      params: {
        apiKey: API_KEY,
        domains:
          'bloomberg.com,techcrunch.com,theverge.com,wired.com,thenextweb.com,arstechnica.com,engadget.com,bbc.com,cnn.com,forbes.com,nytimes.com,wsj.com',
        from,
        to,
        sortBy: 'publishedAt',
      },
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ status: 'Failed', error: err.message });
  }
};
