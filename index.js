const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const port = 3000;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/hodlinfo', { useNewUrlParser: true, useUnifiedTopology: true });

// Defines the ticker schema
const tickerSchema = new mongoose.Schema({
  id_num: Number,
  name: String,
  last: Number,
  buy: Number,
  sell: Number,
  volume: Number,
  base_unit: String
});

// Creates the ticker model
const Ticker = mongoose.model('Ticker', tickerSchema);

// Serve static files (HTML, CSS)
app.use(express.static(path.join(__dirname, 'public')));

// Fetchws data from the WazirX API and store it in MongoDB
app.get('/fetch-tickers', async (req, res) => {
  try {
    const response = await axios.get('https://api.wazirx.com/api/v2/tickers');
    const tickers = Object.values(response.data).slice(0, 10); // Fetch top 10 results
    
    // Clears existing data in the collection
    await Ticker.deleteMany({});

    // Inserts fetched data into the database
    const tickerDocuments = tickers.map(ticker => ({
      id_num: ticker.id_num,
      name: ticker.name,
      last: ticker.last,
      buy: ticker.buy,
      sell: ticker.sell,
      volume: ticker.volume,
      base_unit: ticker.base_unit
    }));
    await Ticker.insertMany(tickerDocuments);

    res.send('Data fetched and stored in the database.');
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while fetching data.');
  }
});

// Route to get data from MongoDB
app.get('/get-tickers', async (req, res) => {
  try {
    const tickers = await Ticker.find({});
    res.json(tickers);
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while retrieving data.');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
