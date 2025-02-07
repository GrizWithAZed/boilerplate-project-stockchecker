'use strict';

const express = require('express');
const axios = require('axios');
const crypto = require('crypto'); // Used for anonymizing IPs
const router = express.Router();

// In-memory storage for likes (this should be replaced with a database in production)
let stockLikes = {};

// Function to hash IP addresses for privacy compliance
function hashIP(ip) {
  return crypto.createHash('sha256').update(ip).digest('hex');
}

module.exports = function (app) {
  app.route('/api/stock-prices')
    .get(async function (req, res) {
      try {
        let { stock, like } = req.query;
        if (!stock) return res.status(400).json({ error: 'Stock symbol required' });
        
        let stocks = Array.isArray(stock) ? stock : [stock]; // Ensure handling for single and multiple stocks
        let results = [];
        let userIP = req.ip || req.connection.remoteAddress; // Get client IP
        let hashedIP = hashIP(userIP); // Anonymize IP

        for (let s of stocks) {
          let response = await axios.get(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${s}/quote`);
          if (!response.data || typeof response.data.latestPrice !== 'number') {
            return res.status(404).json({ error: 'Stock not found' });
          }

          let stockData = {
            stock: String(s.toUpperCase()), // Ensure stock symbol is a string
            price: Number(response.data.latestPrice), // Ensure price is a number
            likes: stockLikes[s] ? Number(stockLikes[s].size) : 0 // Ensure likes are a number
          };

          // Handle the 'like' feature
          if (like === 'true') {
            if (!stockLikes[s]) {
              stockLikes[s] = new Set(); // Store likes using a Set to prevent duplicates
            }
            stockLikes[s].add(hashedIP); // Save the like using the hashed IP
            stockData.likes = Number(stockLikes[s].size);
          }

          results.push(stockData);
        }

        // If two stocks are provided, calculate relative likes
        if (results.length === 2) {
          let rel_likes = results[0].likes - results[1].likes;
          results[0].rel_likes = rel_likes;
          results[1].rel_likes = -rel_likes;
          delete results[0].likes;
          delete results[1].likes;
        }

        // Return JSON response in correct format with 'stockData' property
        res.json({ stockData: stocks.length === 1 ? results[0] : results });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
};
