require('dotenv').config();
const express = require('express');
const Amadeus = require('amadeus');
const app = express();
const PORT = process.env.PORT || 3000;

// initialize Amadeus API client
const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET,
});

app.get('/flights', async (req, res) => {
  try {
    const { origin, destination, departureDate } = req.query;

    if (!origin || !destination || !departureDate) {
      return res.status(400).send({
        message: 'Please provide origin, destination, and departure date in the query parameters.',
      });
    }

    // fetch flight offers
    const response = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate,
      adults: '1',
    });

    // send flight data --> client
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error fetching flight data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
