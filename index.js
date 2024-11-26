const express = require('express');
const fs = require('fs');  // Require fs to handle file system operations
const cors = require('cors');
const multer = require('multer');  // Import multer for handling file uploads
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors()); 

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Specify the directory where uploaded videos will be stored
    const uploadPath = './uploads/videos';
    // Ensure the directory exists
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Set the file name to include the timestamp to avoid naming conflicts
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// Initialize multer with the defined storage
const upload = multer({ storage });

// Path to the JSON file where items will be stored
const dataFilePath = './items.json';

// Function to read the JSON file
const readItemsFromFile = () => {
  try {
    const data = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
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
    const items = readItemsFromFile();
    const newItem = { name, description };
    items.push(newItem);
    writeItemsToFile(items);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: 'Error creating item', error });
  }
});

// Route to handle video uploads
app.post('/api/upload-video', upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No video file uploaded' });
  }

  // Return file information or path
  res.status(200).json({
    message: 'Video uploaded successfully',
    file: req.file.filename,
    path: req.file.path
  });
});

// Basic route
app.get('/', (req, res) => {
  res.send('Welcome to the Express server storing items in a JSON file and handling video uploads.');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
