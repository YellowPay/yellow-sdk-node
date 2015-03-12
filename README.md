Yellow Python SDK
=====================
This is the Yellow Python SDK. This simple SDK contains couple of python methods that makes it easy to integrate with the Yellow API. To get started just:
```
git clone https://github.com/YellowPay/yellow-sdk-python.git
```

Creating Invoices
------------------
To create an invoice, simply call the `create_invoice` function. As an example, create an `example.py` file with the following snippet in the root of the repo you just cloned:
```
import json
import yellow

# This is just for demonstration purposes. In production please store your
# API_KEY & API_SECRET in environment variables.
# You can get your keys from your merchant dashboard.
api_key = "YOUR_API_KEY"
api_secret = "YOUR_API_SECRET"

payload = {
            'base_ccy': "USD", # Required: A 3-letter currency code
            'base_price': "0.05", # Required: The invoice price in the above currency
            'callback': "https://example.com/invoice-callback/", # Optional: URL for Yellow to POST to as a callback
            'redirect': "https://example.com/success/" # Optional: Redirect URL after the invoice is paid
          }

created_invoice = yellow.create_invoice(api_key, api_secret, payload)

# Print the result beautifully!
print json.dumps(created_invoice, sort_keys=True, indent=4)
```
Save the file and run `python example.py` from the repo root. You should see something similar to the following in your terminal:
```
{
    "address": "155xsayoDXxRFP9rxDoecmpVUo7y5xKtc7", # Invoice Address
    "base_ccy": "USD",
    "base_price": "0.05",
    "callback": "https://example.com/invoice-callback/",
    "expiration": "2015-03-10T18:17:51.248Z", # Each invoice expires after 10 minutes of creation
    "id": "6dd264975861fddbfe4404ed995f1ca4", # Invoice ID (to query the invoice later if you need to!)
    "invoice_ccy": "BTC",
    "invoice_price": "0.00017070",
    "received": "0",
    "redirect": "https://example.com/success/",
    "remaining": "0.00017070",
    "server_time": "2015-03-10T18:07:51.454Z",
    "status": "new", # Status of the invoice. Other values are "authorizing" for unconfirmed transactions, and "paid" for confirmed transactions
    "url": "https://cdn.yellowpay.co/invoice.5f0d082e.html?invoiceId=6dd264975861fddbfe4404ed995f1ca4" # Direct URL for the invoice. You can use it to embed the invoice widget in an iframe on your website.
}

```
Query an Invoice
------------------
After you create an invoice, you may need to query the invoice to stay up to date with its status. Just add the following snippet to the `example.py` file you created above:
```
invoice_id = created_invoice['id']

invoice = yellow.query_invoice(api_key, api_secret, invoice_id)
print json.dumps(invoice, sort_keys=True, indent=4)
```
You should see exactly the same returned data you got from `create_invoice` above!
