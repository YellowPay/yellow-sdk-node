var request = require('request');
var crypto  = require('crypto-js');
var os = require('os');

var yellow = module.exports = {};

const YELLOW_SERVER = "https://" + (process.env.YELLOW_SERVER || "api.yellowpay.co");
const VERSION = "0.0.3"

yellow.createInvoice = function(api_key, api_secret, payload, fn){
  /**
   * @param str     api_key        The API_KEY to use for authentication
   * @param str     api_secret     The API_SECRET to use for authentication
   * @param obj     payload        An object literal with keys/values matching the expected
   *                               HTTP arguments described here:
   *                               http://yellowpay.co/docs/api/#creating-invoices
   * @param func.   fn             The callback async function to handle the response.
   *                                   This function takes 3 arguments: error, response, body.
   */


    var url = YELLOW_SERVER + "/v1/invoice/";

    var body = JSON.stringify(payload);

    var nonce = (new Date).getTime();

    var signature = getSignature(url, body, nonce, api_secret)
    
    var options = {
      url: url,
      method: 'POST',
      body: payload,
      json: true,
      headers: {
        'API-Key'      : api_key,
        'API-Nonce'    : nonce,
        'API-Sign'     : signature,
        'API-Plugin'  : VERSION,
        'API-Platform' : getPlatform()
      }
    };

    request(options, fn);
}

yellow.queryInvoice = function(api_key, api_secret, invoice_id, fn){
  /**
   * @param str     api_key        The API_KEY to use for authentication
   * @param str     api_secret     The API_SECRET to use for authentication
   * @param str     invoice_id     The ID of the invoice you're querying
   * @param func.   fn             The callback async function to handle the response.
   *                                   This function takes 3 arguments: error, response, body.
   */

  var url = YELLOW_SERVER + "/v1/invoice/" + invoice_id;

  var nonce = (new Date).getTime();

  var signature = getSignature(url, "", nonce, api_secret);

  var options = {
    url: url,
    method: 'GET',
    json: true,
    headers: {
      'API-Key'      : api_key,
      'API-Nonce'    : nonce,
      'API-Sign'     : signature,
      'API-Plugin'  : VERSION,
      'API-Platform' : getPlatform()
    }
  };

  request(options, fn);
}

yellow.verifyIPN = function(api_secret, host_url, request_nonce, request_signature, request_body){
  /**
   * @param str     api_secret           The API_SECRET to use for verification
   * @param str     host_url             The callback URL you set when you created the invoice
   * @param str     request_nonce        The nonce header of the request
   * @param str     request_signature    The signature header of the request
   * @param str     request_body         The body of the request
   *
   * @returns bool                       This function returns true if the signature matches (verified)
   *                                             returns false if the signature DOESN'T match (not verified)
   */

   var signature = getSignature(host_url, request_body, request_nonce, api_secret);
   return signature === request_signature
}

function getSignature(url, body, nonce, api_secret){
  /**
   * A tiny function used by our SDK to sign and verify requests.
  */

    var message = nonce.toString() + url + body;
    return crypto.HmacSHA256(message, api_secret).toString();
}

function getPlatform(){
  return os.platform() + " " + os.release() - "Node.js " + process.version;
}
