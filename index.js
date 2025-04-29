/* ---------- index.js  CommonJS COMPLETE ---------- */
const express = require('express');
const cors    = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb+srv://metaverseApp:5XykflcaFgNmHXvG@cluster0.gtelrbo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('metaverse');
  console.log('✔ Mongo connected');

  const app = express();
  app.use(cors());
  app.use(express.json());

  /* ───── video routes stay unchanged ───── */
  app.get('/video/:screenId', async (req, res) => {
    const doc = await db.collection('videos').findOne({ _id: req.params.screenId });
    if (!doc) return res.status(404).send('no video');
    res.json(doc);
  });

  app.post('/video/:screenId', async (req, res) => {
    await db.collection('videos').updateOne(
      { _id: req.params.screenId },
      { $set: { mp4Url: req.body.mp4Url } },
      { upsert: true }
    );
    res.sendStatus(204);
  });

  /* ───── session start ───── */
  app.post('/sessions/start', async (req, res) => {
    const doc = {
      userId : req.body.userId || 'Guest',
      room   : req.body.room   || null,
      joined : new Date(),
      active : true
    };
    const r = await db.collection('sessions').insertOne(doc);
    res.status(201).json({ _id: r.insertedId });
  });

  /* ───── session end ───── */
  app.post('/sessions/end', async (req, res) => {
    const id   = new ObjectId(req.body._id);
    const left = new Date();

    const prev = await db.collection('sessions').findOne({ _id: id });
    const dur  = prev ? (left - prev.joined) / 1000 : null;  // seconds

    await db.collection('sessions').updateOne(
      { _id: id },
      { $set: { left, durationSeconds: dur, active: false } }
    );
    res.sendStatus(204);
  });

  app.listen(process.env.PORT || 4000,
    () => console.log(`🌐 API up on ${process.env.PORT || 4000}`));
}

main().catch(err => { console.error(err); process.exit(1); });
