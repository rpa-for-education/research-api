const mongoose = require('mongoose');
const express = require('express');
const compression = require('compression');

const app = express();

app.use(compression());
app.use(express.json());

// Hàm kết nối MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Tạm thời giữ bufferCommands: false, nhưng sẽ xử lý đồng bộ
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      heartbeatFrequencyMS: 1000,
      maxPoolSize: 20,
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    throw err;
  }
};

// Định nghĩa schema và model (không cần kết nối trước)
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

// Hàm wrapper để đảm bảo kết nối trước khi thực thi
const withDBConnection = async (callback) => {
  try {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    } else if (mongoose.connection.readyState === 2 || mongoose.connection.readyState === 3) {
      await new Promise((resolve) => {
        mongoose.connection.on('connected', resolve);
      });
    }
    return await callback();
  } catch (err) {
    throw err;
  }
};

// GET journals
app.get('/api/journals', async (req, res) => {
  try {
    const journals = await withDBConnection(() => Journal.find());
    res.json(journals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new journal
app.post('/api/journals', async (req, res) => {
  try {
    const journal = await withDBConnection(() =>
      new Journal({
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
      }).save()
    );
    res.status(201).json(journal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update a journal
app.put('/api/journals/:id', async (req, res) => {
  try {
    const journal = await withDBConnection(async () => {
      const doc = await Journal.findById(req.params.id);
      if (doc) {
        Object.assign(doc, req.body);
        return await doc.save();
      } else {
        return null;
      }
    });
    if (journal) {
      res.json(journal);
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
    const journal = await withDBConnection(async () => {
      const doc = await Journal.findById(req.params.id);
      if (doc) {
        await doc.remove();
        return { message: 'Journal deleted' };
      } else {
        return null;
      }
    });
    if (journal) {
      res.json(journal);
    } else {
      res.status(404).json({ message: 'Journal not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Xuất app cho Vercel
module.exports = app;