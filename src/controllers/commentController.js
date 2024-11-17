import Article from '../models/Article.js';
import Comment from '../models/Comment.js';

export const createComment = async (req, res) => {
  try {
    const { userId } = req;
    const { articleId, contents } = req.body;
    const newComment = new Comment({
      userId,
      articleId,
      contents,
    });
    await newComment.save();
    await Article.findByIdAndUpdate(
      articleId,
      { $push: { comments: newComment._id } },
      { new: true }
    );
    res.status(200).json({ status: 'success' });
  } catch (err) {
    res.status(400).json({ status: 'failed', error: err.message });
  }
};

// no longer in use - comments will be populated in getArticle
export const getCommentsByArticle = async (req, res) => {
  try {
    const { articleId } = req.query;
    const commentList = await Comment.find({ articleId }).populate('userId');
    res.status(200).json({ status: 'success', commentList });
  } catch (err) {
    res.status(400).json({ status: 'failed', error: err.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { id } = req.body;
    await Comment.findOneAndDelete(id);
  } catch (err) {
    res.status(400).json({ status: 'Failed', error: err.message });
  }
};
