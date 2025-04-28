const express = require('express');
const cors    = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb+srv://metaverseApp:5XykflcaFgNmHXvG@cluster0.gtelrbo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function main() {
  // ───── connect to Mongo ─────
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('metaverse');
  console.log('✔ Connected to MongoDB');

  // ───── create Express app ─────
  const app = express();
  app.use(cors());
  app.use(express.json());

  // -------- REST endpoints --------
  app.get('/videos', async (_, res) => {
    const list = await db.collection('videos').find().toArray();
    res.json(list);
  });

  app.post('/videos/:id/current', async (req, res) => {
    const id = new ObjectId(req.params.id);
    await db.collection('videos').updateMany({}, { $set: { isCurrent: false } });
    await db.collection('videos').updateOne({ _id: id }, { $set: { isCurrent: true } });
    res.sendStatus(204);
  });

  app.post('/sessions/start', async (req, res) => {
    const result = await db.collection('sessions').insertOne(req.body);
    res.status(201).json({ _id: result.insertedId });
  });

  app.post('/sessions/end', async (req, res) => {
    await db.collection('sessions').updateOne(
      { _id: new ObjectId(req.body._id) },
      { $set: { left: req.body.left } }
    );
    res.sendStatus(204);
  });

  // ───── start server ─────
  app.listen(4000, () => console.log('🌐 API running on http://localhost:4000'));
}

main().catch(err => {
  console.error('Mongo connection failed:', err);
  process.exit(1);
});
