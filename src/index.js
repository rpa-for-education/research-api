const mongoose = require('mongoose');
const express = require('express');
const compression = require('compression');
let isConnected = false;

const app = express();

app.use(compression());
app.use(express.json());

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

// Định nghĩa kết nối MongoDB
const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    return; // Tránh gọi lại nếu đã kết nối
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      heartbeatFrequencyMS: 1000,
      maxPoolSize: 20,
    });
    isConnected = true;
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    throw err; // Ném lỗi để xử lý ở cấp cao hơn
  }
};

// Middleware kiểm tra kết nối trước khi xử lý request
app.use(async (req, res, next) => {
  if (!isConnected) {
    try {
      await connectDB();
    } catch (err) {
      return res.status(500).json({ message: 'Database connection failed' });
    }
  }
  next();
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

const PORT = process.env.PORT || 3000;

// Khởi động server sau khi kết nối
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Server start aborted due to DB error:', err.message);
  }
};

startServer();