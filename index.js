const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors()); 

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Define a schema and model (example for 'items' collection)
const itemSchema = new mongoose.Schema({
  name: String,
  description: String,
});

const Item = mongoose.model('Item', itemSchema);

// Route to get all items
app.get('/api/items', async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data', error });
  }
});

// Route to create a new item
app.post('/api/items', async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    return res.status(400).json({ message: 'Name and description are required' });
  }

  try {
    const newItem = new Item({ name, description });
    await newItem.save();
    res.status(201).json(newItem); // Return the created item
  } catch (error) {
    res.status(500).json({ message: 'Error creating item', error });
  }
});

// Basic route
app.get('/', (req, res) => {
  res.send('Welcome to the Express MongoDB server');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
