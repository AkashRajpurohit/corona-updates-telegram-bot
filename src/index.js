require('dotenv').config();
const getInformation = require('./utils/getInformation');

(async() => {
    const result = await getInformation()
    console.log(result)
})()