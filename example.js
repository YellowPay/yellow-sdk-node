var yellow = require('./lib/yellow.js');

api_key = 'YOUR_API_KEY'
api_secret = 'YOUR_API_SECRET'
base_ccy = 'USD'
base_price = '0.05'
callback = 'https://example.com'

yellow.createInvoice(api_key,
  api_secret,
  base_ccy,
  base_price,
  callback,
  function(error, response, body){
    if (!error && response.statusCode == 200) {
        console.log(body);
    }

})
