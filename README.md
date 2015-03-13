Yellow Node.js SDK
=====================
This is the Yellow Node SDK. This simple SDK contains couple of node functions that makes it easy to integrate with the Yellow API. To get started just:
```
sudo npm install yellow-sdk-node
```

Examples
---------
```
var yellow = require('yellow-sdk-node');

var api_key = 'YOUR_API_KEY', // store it in environment variable for better security
    api_secret = 'YOUR_API_SECRET', //// store it in environment variable for better security
    base_ccy = 'USD',
    base_price = '0.05',
    callback = 'https://example.com'; // Optional

yellow.createInvoice(api_key, api_secret, base_ccy, base_price, callback, function(error, response, body){
    if (!error && response.statusCode == 200) {
        //print the result beautifully
        console.log(JSON.stringify(body, null, 4));
    } else if(error) {
      console.log(error)
    }

});
```
With no errors, you should see something similar to the following in your terminal:
```
{
    "address": "155xsayoDXxRFP9rxDoecmpVUo7y5xKtc7", // Invoice Address
    "base_ccy": "USD",
    "base_price": "0.05",
    "callback": "https://example.com",
    "expiration": "2015-03-10T18:17:51.248Z", // Each invoice expires after 10 minutes of creation
    "id": "6dd264975861fddbfe4404ed995f1ca4", // Invoice ID (to query the invoice later if you need to!)
    "invoice_ccy": "BTC",
    "invoice_price": "0.00017070",
    "received": "0",
    "redirect": null,
    "remaining": "0.00017070",
    "server_time": "2015-03-10T18:07:51.454Z",
    "status": "new", // Status of the invoice. Other values are "authorizing" for unconfirmed transactions, and "paid" for confirmed transactions
    "url": "https://cdn.yellowpay.co/invoice.5f0d082e.html?invoiceId=6dd264975861fddbfe4404ed995f1ca4" // Direct URL for the invoice. You can use it to embed the invoice widget in an iframe on your website.
}

```
To query an invoice that you created, just pass in the `invoice_id` to the `queryInvoice` function:
```
yellow.queryInvoice(api_key, api_secret, invoice_id, function(error, response, body){
    if (!error && response.statusCode == 200) {
        //print the result beautifully
        console.log(JSON.stringify(body, null, 4));
    } else if(error) {
      console.log(error)
    }

});
```
With no errors, you should get the same invoice data you got when you created the invoice.

Verify Yellow POST requests
---------------------------
To verify that the request you just receive really is from us, we created a helper function that checks the signature of the request. Just pass in your api_secret, the callback URL you passed when you created the invoice, and the request object.

This function will return true if the signature matches (verified), or false if it doesn't match (not verified).
```
var isVerified = yellow.verifyIPN(api_secret, host_url, request)
```
