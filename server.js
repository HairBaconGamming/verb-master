// server.js
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Import các routes
const userRoutes = require('./routes/userRoutes');
const progressRoutes = require('./routes/progressRoutes');

// Cấu hình dotenv để đọc tệp .env
dotenv.config();

// Kết nối đến cơ sở dữ liệu
connectDB();

const app = express();

// Middleware để cho phép Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Middleware để phân tích body của request dạng JSON
app.use(express.json());

const port = process.env.PORT || 3000;

// Định nghĩa các API Routes
app.use('/api/users', userRoutes);
app.use('/api/progress', progressRoutes);

// Phục vụ các tệp tĩnh từ thư mục 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Route bắt tất cả để phục vụ trang index.html cho các yêu cầu không khớp
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
  console.log(`VerbMaster is running! Access it via your Glitch project's URL.`);
});