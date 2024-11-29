import Article from '../models/Article.js';

export const cleanUpScheduler = async () => {
  let fromDateObj = new Date();
  fromDateObj.setDate(fromDateObj.getDate() - 8);

  const response = await Article.deleteMany({
    deleteFlag: true,
    publishedAt: { $lte: fromDateObj },
  }).exec();
};
