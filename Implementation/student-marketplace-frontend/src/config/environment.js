// Environment Configuration for Student Marketplace
// Switch between local development and production by changing the ENVIRONMENT variable

const ENVIRONMENT = 'local'; // Change to 'production' when deploying

const config = {
  local: {
    API_URL: 'http://10.0.0.26:5000/api',
  },
  production: {
    API_URL: 'https://studentmarketplace-backend.onrender.com/api', // Update with your actual Render URL
  }
};

export const API_URL = config[ENVIRONMENT].API_URL;

export default config[ENVIRONMENT];