
import axios from 'axios';
import Holiday from '../models/Holiday.js';

const CALENDARIFIC_API_KEY = 'KaYQqWflRrKhALSusyoyVEjJV7EcXbbX'; // Replace with your actual Calendarific API key

export const getHolidays = async (req, res) => {
  const { country, year } = req.query;

  if (country !== 'IN') {
    return res.status(400).json({ error: 'Currently, only India (IN) is supported.' });
  }

  try {
    // Fetch holidays from Calendarific API
    const response = await axios.get(`https://calendarific.com/api/v2/holidays`, {
      params: {
        api_key: CALENDARIFIC_API_KEY,
        country: country,
        year: year,
      },
    });

    // Map the response to your desired format
    const holidays = response.data.response.holidays.map(h => ({
      country,
      date: h.date.iso,
      localName: h.name,
      name: h.name,
      description: h.description,
      type: h.type.join(', ')
    }));

    // Save in DB for caching (optional)
    await Holiday.insertMany(holidays, { ordered: false }).catch(() => {});

    res.json(holidays);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch holidays' });
  }
};
