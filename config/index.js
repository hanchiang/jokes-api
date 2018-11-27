const nodeEnv = process.env.NODE_ENV || 'development';
if (nodeEnv === 'development') {
  require('dotenv').config();
} else {
  require('dotenv').config({ path: '.env.prod' });
}