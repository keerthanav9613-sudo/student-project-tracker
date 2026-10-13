import express from 'express';

const app = express();

// Serve frontend files from the public folder
app.use(express.static('public'));

// Allow the server to read JSON request bodies
app.use(express.json({ limit: '10kb' }));

// Health check API route
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// Start the server
const port = Number(process.env.PORT || 3000);

app.listen(port, () => {
  console.log(`Open http://localhost:${port}`);
});