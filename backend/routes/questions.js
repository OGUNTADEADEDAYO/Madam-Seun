const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const { protect } = require('../middleware/auth');

router.post('/', async (req, res) => {
  try {
    const { email, question } = req.body;
    if (!email || !question) {
      return res.status(400).json({ error: 'Email and question are required' });
    }

    const newQuestion = new Question({ email, question });
    await newQuestion.save();

    res.status(201).json({ message: 'Question received', question: newQuestion });
  } catch (err) {
    console.error('Error submitting question:', err);
    res.status(500).json({ error: 'Failed to submit question' });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const questions = await Question.find().sort({ createdAt: -1 });
    res.json({ questions });
  } catch (err) {
    console.error('Error fetching questions:', err);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

router.patch('/:id', protect, async (req, res) => {
  try {
    const { isAnswered } = req.body;
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { isAnswered },
      { new: true }
    );
    if (!question) return res.status(404).json({ error: 'Question not found' });
    res.json(question);
  } catch (err) {
    console.error('Error updating question:', err);
    res.status(500).json({ error: 'Failed to update question' });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) return res.status(404).json({ error: 'Question not found' });
    res.json({ message: 'Question deleted' });
  } catch (err) {
    console.error('Error deleting question:', err);
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

module.exports = router;
