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


app.get('/search-flights', async (req, res) => {
  const { origin, destination, departureDate, returnDate, adults } = req.query;
  
  try {
    const response = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate,
      returnDate,
      adults,
    });
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//confirm Flight Price
app.post('/confirm-price', async (req, res) => {
  const { flightOffers } = req.body;
  
  try {
    const response = await amadeus.shopping.flightOffers.pricing.post(
      JSON.stringify({ data: { type: 'flight-offers-pricing', flightOffers } })
    );
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//create a Flight Booking
app.post('/create-booking', async (req, res) => {
  const { flightOffers, travelers } = req.body;
  
  try {
    const response = await amadeus.booking.flightOrders.post(
      JSON.stringify({
        data: {
          type: 'flight-order',
          flightOffers,
          travelers,
        },
      })
    );
    res.status(201).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//retrieve Flight Order
app.get('/flight-order/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const response = await amadeus.booking.flightOrder(id).get();
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//retrieve Seat Maps
app.post('/seatmaps', async (req, res) => {
  const { flightOffers } = req.body;

  try {
    const response = await amadeus.shopping.seatmaps.post(
      JSON.stringify({ data: flightOffers })
    );
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//lookup Airline Information
app.get('/airline-info', async (req, res) => {
  const { airlineCode } = req.query;

  try {
    const response = await amadeus.referenceData.airlines.get({
      airlineCodes: airlineCode,
    });
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//search for Airports or Cities
app.get('/search-airports', async (req, res) => {
  const { keyword } = req.query;

  if (!keyword) {
    return res.status(400).json({ error: 'Please provide a keyword for searching.' });
  }

  try {
    const response = await amadeus.referenceData.locations.get({
      keyword,
      subType: 'AIRPORT,CITY'
    });
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//retrieve Airline Check-in Links
app.get('/checkin-links', async (req, res) => {
  const { airlineCode } = req.query;

  try {
    const response = await amadeus.referenceData.urls.checkinLinks.get({
      airlineCode,
    });
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Flight booking server is running on http://localhost:${PORT}`);
});
