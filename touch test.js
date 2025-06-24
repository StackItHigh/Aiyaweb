console.log("Starting test server...");

try {
  const express = require('express');
  const app = express();
  
  app.get('/', (req, res) => {
    res.send('Hello World!');
  });
  
  const PORT = 5000;  // Using a different port
  app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
  });
  
  console.log("Server setup complete");
} catch (error) {
  console.error("ERROR:", error);
}
