const mongoose = require('mongoose');
const express = require('express');
const compression = require('compression');

const app = express();

app.use(compression());
app.use(express.json());

let cachedDb = null;

const connectDB = async () => {
  if (cachedDb && cachedDb.readyState === 1) {
    return cachedDb;
  }

  try {
    console.log('Attempting to connect to MongoDB with URI:', process.env.MONGODB_URI); // Debug
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: true, // Quan trọng: Bật buffering
      serverSelectionTimeoutMS: 5000,
      heartbeatFrequencyMS: 1000,
      maxPoolSize: 20,
    });
    cachedDb = db;
    console.log('Successfully connected to MongoDB');
    return db;
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    throw err;
  }
};

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

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Middleware error:', err.message); // Debug
    res.status(503).json({ message: 'Service unavailable: Database connection failed' });
  }
});

app.get('/api/journals', async (req, res) => {
  try {
    console.log('Fetching journals...'); // Debug
    const journals = await Journal.find().select('_id Title Rank Country H_index');
    res.json(journals);
  } catch (err) {
    console.error('Fetch error:', err.message); // Debug
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/journals', async (req, res) => {
  try {
    const journal = new Journal(req.body);
    const newJournal = await journal.save();
    res.status(201).json(newJournal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

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

module.exports = app;