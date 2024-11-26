const express = require('express');
const fs = require('fs');  // Require fs to handle file system operations
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors()); 

// Path to the JSON file where items will be stored
const dataFilePath = './items.json';

// Function to read the JSON file
const readItemsFromFile = () => {
  try {
    const data = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(data); // Parse the data into an array
  } catch (error) {
    return []; // If the file doesn't exist or can't be read, return an empty array
  }
};

// Function to write to the JSON file
const writeItemsToFile = (items) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(items, null, 2), 'utf8');
};

// Route to get all items
app.get('/api/items', (req, res) => {
  try {
    const items = readItemsFromFile();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data', error });
  }
});
// Route to create a new item
app.post('/api/items', (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    return res.status(400).json({ message: 'Name and description are required' });
  }

  try {
    // Get existing items from the JSON file
    const items = readItemsFromFile();

    // Create a new item and add it to the items array
    const newItem = { name, description };
    items.push(newItem);

    // Save the updated items array to the JSON file
    writeItemsToFile(items);

    res.status(201).json(newItem); // Return the created item
  } catch (error) {
    res.status(500).json({ message: 'Error creating item', error });
  }
});

// Basic route
app.get('/', (req, res) => {
  res.send('Welcome to the Express server storing items in a JSON file');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
