'use strict';
const axios = require('axios'); 

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function run() {
  let responseCount = 0;
  while (true) {
    try {
      const response = await axios.get('http://localhost:3000');
      console.log(`response # ${responseCount++} with data: ${response.data}`);
    } catch (err) {
      console.log(`err: ${err}`)
    } finally {
      await sleep(1000);
    }
    
  }
}

run().then(() => {});