const mongoose = require('mongoose');
const express = require('express');
const compression = require('compression');

const app = express();

app.use(compression());
app.use(express.json());

// Singleton connection function
const connectDB = async () => {
  if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
    return mongoose.connection;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: true, // Bật lại bufferCommands để xử lý cold start
      serverSelectionTimeoutMS: 5000,
      heartbeatFrequencyMS: 1000,
      maxPoolSize: 20,
    });
    console.log('Connected to MongoDB');
    return mongoose.connection;
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    throw err;
  }
};

// Định nghĩa schema và model
const journalSchema = new mongoose.Schema({
  Rank: Number,
  Sourceid: String,
  Title: String,
  Type: String,
  Issn: String,
  SJR: String,
  H_index: Number,
  Total_Docs: Object,
  Total_Refs: Object,
  Total_Citations: Object,
  Citable_Docs: Object,
  Citations_per_Doc: Object,
  Ref: Object,
  Female: String,
  Overton: Number,
  SDG: Number,
  Country: String,
  Region: String,
  Publisher: String,
  Coverage: String,
  Categories: String,
  Areas: String
});
const Journal = mongoose.model('Journal', journalSchema, 'journal');

// Middleware kiểm tra và kết nối
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(503).json({ message: 'Service unavailable: Database connection failed' });
  }
});

// GET journals
app.get('/api/journals', async (req, res) => {
  try {
    const journals = await Journal.find();
    res.json(journals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new journal
app.post('/api/journals', async (req, res) => {
  try {
    const journal = new Journal({
      Rank: req.body.Rank,
      Sourceid: req.body.Sourceid,
      Title: req.body.Title,
      Type: req.body.Type,
      Issn: req.body.Issn,
      SJR: req.body.SJR,
      H_index: req.body.H_index,
      Total_Docs: req.body.Total_Docs,
      Total_Refs: req.body.Total_Refs,
      Total_Citations: req.body.Total_Citations,
      Citable_Docs: req.body.Citable_Docs,
      Citations_per_Doc: req.body.Citations_per_Doc,
      Ref: req.body.Ref,
      Female: req.body.Female,
      Overton: req.body.Overton,
      SDG: req.body.SDG,
      Country: req.body.Country,
      Region: req.body.Region,
      Publisher: req.body.Publisher,
      Coverage: req.body.Coverage,
      Categories: req.body.Categories,
      Areas: req.body.Areas
    });
    const newJournal = await journal.save();
    res.status(201).json(newJournal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update a journal
app.put('/api/journals/:id', async (req, res) => {
  try {
    const journal = await Journal.findById(req.params.id);
    if (journal) {
      Object.assign(journal, req.body);
      const updatedJournal = await journal.save();
      res.json(updatedJournal);
    } else {
      res.status(404).json({ message: 'Journal not found' });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a journal
app.delete('/api/journals/:id', async (req, res) => {
  try {
    const journal = await Journal.findById(req.params.id);
    if (journal) {
      await journal.remove();
      res.json({ message: 'Journal deleted' });
    } else {
      res.status(404).json({ message: 'Journal not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Xuất app cho Vercel
module.exports = app;