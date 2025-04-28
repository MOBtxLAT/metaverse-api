/* ---------- index.js  (CommonJS) ---------- */
const express = require('express');
const cors    = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb+srv://metaverseApp:5XykflcaFgNmHXvG@cluster0.gtelrbo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('metaverse');
  console.log('✔ Connected to MongoDB');

  const app = express();
  app.use(cors());
  app.use(express.json());

  /* ---- GET one screen’s video ---- */
  app.get('/video/:screenId', async (req, res) => {
    const doc = await db.collection('videos').findOne({ _id: req.params.screenId });
    if (!doc) return res.status(404).send('no video');
    res.json(doc);                           // { _id, mp4Url }
  });

  /* ---- UPDATE one screen’s video ---- */
  app.post('/video/:screenId', async (req, res) => {
    await db.collection('videos').updateOne(
      { _id: req.params.screenId },
      { $set: { mp4Url: req.body.mp4Url } },
      { upsert: true }
    );
    res.sendStatus(204);
  });

  /* ---- optional: session routes stay unchanged ---- */
  app.post('/sessions/start', async (req,res)=>{
    const r = await db.collection('sessions').insertOne(req.body);
    res.status(201).json({ _id: r.insertedId });
  });
  app.post('/sessions/end', async (req,res)=>{
    await db.collection('sessions').updateOne(
      { _id: new ObjectId(req.body._id) },
      { $set:{ left:req.body.left }});
    res.sendStatus(204);
  });

  app.listen(process.env.PORT || 4000,
    ()=>console.log(`🌐 API on ${process.env.PORT||4000}`));
}

main().catch(err=>{ console.error(err); process.exit(1); });
