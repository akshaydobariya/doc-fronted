module.exports = {
  // Configure the data directory path
  dataDir: process.env.NODE_ENV === 'production' ? './data' : './data',

  // For Vercel deployment, use relative paths
  buildCommand: 'react-scripts build',
  startCommand: 'react-scripts start',

  // Ensure data directory is copied correctly
  copyDataDir: true,

  // Additional configuration for production builds
  production: {
    dataDir: './data'
  }
};