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


app.use(express.json());

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

//city and airport search
app.get('/city-airport/:cityAirport', async (req, res) => {
  const { cityAirport } = req.params;

  try{
    const response = await amadeus.referenceData.locations.get({
      keyword: cityAirport,
      subType: Amadeus.location.any,
    });
    res.status(200).json(response.data);
  } catch(error){
    console.log(error);
    res.status(500).json({ error: error.message });
  }
})

//getAirport routes
app.get('/airport-routes', async (req, res) => {
  const { departureAiportCode } = req.query;

  try {
    const response = await amadeus.airport.directDestinations.get({
      departureAiportCode: departureAiportCode,
    })
    res.status(200).json(response.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
})

//airline routes, fina all destination for this airline
app.get('/airline-destination/:airlineCode', async (req, res) => {
  const { airlineCode } = req.params;

  try {
    const response = await amadeus.airlines.destinations.get({
      airlineCode,
    });
    res.status(200).json(response.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
})

//flight inspiration
app.get('/flight-inspiration/:origin', async (req, res) => {
  const { origin } = req.params; //the city which the flight will depart

  try {
    const response = await amadeus.shopping.flightDestination.get({
      origin: origin,
    })
    res.status(200).json(response.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
})

//cheapest date search
app.get('/cheapest-date', async (req, res) => {
  const { origin, destination } = req.query;

  try {
    const response = await amadeus.shopping.flightDates.get({
      origin: origin,
      destination: destination,
    });
    res.status(200).json(response.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
})

//find the cheapest flight from A -> B
app.post('/cheapest-flight', async (req, res) => {
  const { origin, destination, departureDate, adults } = req.body;

  try {
    const response = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate,
      adults,
    });
    const cheapestFlight = response.data.sort((a, b) => a.price.total - b.price.total)[0];
    res.status(200).json(cheapestFlight);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
})

//book a flight from A -> B
app.post('/book-flight', async (req, res) => {
  const { origin, destination, departureDate, adults, dateOfBirth, name, gender, contact, documents } = req.body;

  try {
    //get flight offer
    const offerResponse = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate,
      adults,
    });

    //price: get detailed pricing info
    const priceResponse = await amadeus.shopping.flightOffers.pricing.post(
      JSON.stringify({
        'data': {
          'type': 'flight-offers-pricing',
          'flightOffers': [
            offerResponse.data[0]
          ]
        }
      })
    );

    //use pricing data to book flight
    const bookResponse = await amadeus.booking.flightOrders.post(
      JSON.stringify({
        'data': {
          'type': 'flight-order',
          'flightOffers': [priceResponse.data.flightOffers[0]],
          'travelers': [{
            'id': '1',
            'dateOfBirth': dateOfBirth,
            'name': name,
            'gender': gender,
            'contact': contact,
            'documents': documents,
          }]
        }
      })
    );
    //responde with booking info
    res.status(200).json(bookResponse.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});


app.listen(PORT, () => {
  console.log(`listening and serving: ${PORT}`);
});
