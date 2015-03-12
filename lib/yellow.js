var request = require('request');
var crypto  = require('crypto-js');

var yellow = module.exports = {};

const YELLOW_SERVER = "https://" + (process.env.YELLOW_SERVER || "api.yellowpay.co");


yellow.createInvoice = function(api_key, api_secret, base_ccy, base_price, callback, fn){
  /**
   * @param str     api_key        The API_KEY to use for authentication
   * @param str     api_secret     The API_SECRET to use for authentication
   * @param str     base_ccy       Currency code. eg: "USD"
   * @param str     base_price     Invoice price in the above currency. eg: "0.05"
   * @param str     callback       Callback URL that we'll  use to POST payment notifications
   * @param func.   fn             The callback async function to handle the response.
   *                                   This function takes 3 arguments: error, response, body.
   */

   if (typeof callback == "function") {
      fn = callback;
      callback = null;
    }

    var url = YELLOW_SERVER + "/v1/invoice/"

    var payload = {
            base_ccy   : base_ccy,
            base_price : base_price
    }

    if(callback) payload.callback = callback

    var body = JSON.stringify(payload)

    var nonce = (new Date).getTime();

    var signature = getSignature(url, body, nonce, api_secret)

    var options = {
      url: url,
      method: 'POST',
      body: payload,
      json: true,
      headers: {
        'API-Key': api_key,
        'API-Nonce' : nonce,
        'API-Sign' : signature
      }
    };

    request(options, fn)
}

yellow.queryInvoice = function(apiKey, apiSecret, invoice_id, fn){
  /**
   * @param str     api_key        The API_KEY to use for authentication
   * @param str     api_secret     The API_SECRET to use for authentication
   * @param str     invoice_id     The ID of the invoice you're querying
   * @param func.   fn             The callback async function to handle the response.
   *                                   This function takes 3 arguments: error, response, body.
   */

  var url = YELLOW_SERVER + "/v1/invoice/" + invoice_id

  var nonce = (new Date).getTime();

  var signature = getSignature(url, "", nonce, api_secret)

  var options = {
    url: url,
    method: 'GET',
    json: true,
    headers: {
      'API-Key': api_key,
      'API-Nonce' : nonce,
      'API-Sign' : signature
    }
  };

  request(options, fn)
}

function getSignature(url, body, nonce, apiSecret){
    var message = nonce.toString() + url + body
    return crypto.HmacSHA256(message, api_secret);
}
