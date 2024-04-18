const express = require('express');
const cors = require('cors');
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs');
const moment = require('moment');


const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());

// Middleware for parsing JSON bodies
app.use(express.json());

// Set up storage for uploaded files using multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      if (file.fieldname === 'excel') {
        cb(null, 'uploads/excel');
      } else if (file.fieldname === 'pdf') {
        cb(null, 'uploads/pdf');
      }
    },
    filename: function (req, file, cb) {
      const timestamp = moment().format('YYYYMMDD-HHmmss');
      cb(null, timestamp + '-' + file.originalname);
    }
  });
const upload = multer({ storage: storage });

// Parse Excel file and extract task information
const parseExcelFile = (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(worksheet, { header: 'A' }); // Assuming tasks are in column A
  return data.map(item => ({ title: item.A }));
};

// Serve static files (e.g., PDF attachments)
app.use('/pdfs', express.static('uploads/pdf'));

// Endpoint for file upload
app.post('/upload', upload.fields([
  { name: 'excel', maxCount: 1 },
  { name: 'pdf', maxCount: 1 }
]), (req, res) => {
  try {
    const excelFile = req.files['excel'][0];
    const pdfFile = req.files['pdf'][0];

    if (!excelFile || !pdfFile) {
      return res.status(400).json({ error: 'Both Excel and PDF files are required' });
    }

    const excelFilePath = excelFile.path;
    const pdfFilePath = pdfFile.path;

    const tasks = parseExcelFile(excelFilePath);

    // Save tasks and PDF file paths to database or perform other operations

    res.status(200).json({ message: 'Files uploaded successfully', tasks });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// CRUD endpoints for tasks

// Example in-memory storage for tasks
let tasks = [];

app.get('/tasks', (req, res) => {
  res.json(tasks);
});

app.post('/tasks', (req, res) => {
  const { title } = req.body;
  const newTask = { id: tasks.length + 1, title };
  tasks.push(newTask);
  return res.status(201).json(newTask);
});

app.put('/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const { title } = req.body;
  const taskIndex = tasks.findIndex(task => task.id === taskId);
  if (taskIndex !== -1) {
    tasks[taskIndex].title = title;
    res.json(tasks[taskIndex]);
  } else {
    return res.status(404).json({ error: 'Task not found' });
  }
});

app.delete('/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  tasks = tasks.filter(task => task.id !== taskId);
 return res.sendStatus(204);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
