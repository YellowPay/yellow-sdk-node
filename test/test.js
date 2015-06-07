var assert = require('chai').assert,
    sinon = require('sinon'),
    crypto  = require('crypto-js'),
    yellow = require('yellow-sdk');
    
const DEFAULT_KEY = "KEY" 
const DEFAULT_SECRET = "SECRET"
const API_KEY = process.env.TEST_API_KEY
const API_SECRET = process.env.TEST_API_SECRET
const TEST_INVOICE_ID = ""
const CALLBACK = "https://example.com/ipn"
const BASE_CCY = "USD"
const BASE_PRICE = "0.1"
const STYLE = "cart"
const ORDER = "1234567"

describe('createInvoice()', function(){
  it('should create basic invoice', function(){
    
    payload = {
            base_ccy   : BASE_CCY,
            base_price : BASE_PRICE,
            callback   : CALLBACK,
            style      : STYLE,
            order      : ORDER
    };
    yellow.createInvoice(API_KEY, API_SECRET, payload, function(error, response, body){
      assert.equal(body['status'], 'loading');
      assert.equal(body['received'], '0');
      assert.equal(body['invoice_ccy'], 'BTC');
      assert.equal(body['callback'], CALLBACK);
      assert.equal(body['order'], ORDER);
      assert.equal(body['style'], STYLE);
      assert.equal(body['base_ccy'], BASE_CCY);
      assert.equal(body['base_price'], BASE_PRICE);
      assert.equal(body['remaining'], body['invoice_price']);
      
      var expiration = new Date(body['expiration']),
          server_time = new Date(body['server_time'])
      assert.isTrue(expiration > server_time)
      
      assert.lengthOf(body['id'], 26);
      
      var i = body['id'].length;
      while (i--) {
        assert.include('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', body['id'][i]);
      }
      
      TEST_INVOICE_ID = body['id']
      

    });
  });
  
  
  it('should return authentication error', function(){
    payload = {
            base_ccy   : BASE_CCY,
            base_price : BASE_PRICE,
            callback   : CALLBACK,
            style      : STYLE,
            order      : ORDER
    };
    
    yellow.createInvoice(DEFAULT_KEY, DEFAULT_SECRET, payload, function(error, response, body){
      assert.notEqual(response.statusCode, 200)
      
    })
  });

  it('should return nonce error', function(){
    payload = {
            base_ccy   : BASE_CCY,
            base_price : BASE_PRICE,
            callback   : CALLBACK,
            style      : STYLE,
            order      : ORDER
    };
    
    fakeTime = sinon.useFakeTimers(new Date(1992,12,29).getTime());
    yellow.createInvoice(API_KEY, API_SECRET, payload, function(error, response, body){
      assert.notEqual(response.statusCode, 200)
      
    });
    fakeTime.restore();
  });
  
  it('should return minimum price error', function(){
    payload = {
            base_ccy   : BASE_CCY,
            base_price : '0.01',
            callback   : CALLBACK,
            style      : STYLE,
            order      : ORDER
    };
    
    yellow.createInvoice(API_KEY, API_SECRET, payload, function(error, response, body){
      assert.notEqual(response.statusCode, 200)
      
    })
  });
  
  it('should return base_ccy error', function(){
    payload = {
            base_ccy   : 'xxx',
            base_price : BASE_PRICE,
            callback   : CALLBACK,
            style      : STYLE,
            order      : ORDER
    };
    
    yellow.createInvoice(API_KEY, API_SECRET, payload, function(error, response, body){
      assert.notEqual(response.statusCode, 200)
      
    })
  });
  
  it('should return callback error', function(){
    payload = {
            base_ccy   : BASE_CCY,
            base_price : BASE_PRICE,
            callback   : 'xxx',
            style      : STYLE,
            order      : ORDER
    };
    
    yellow.createInvoice(API_KEY, API_SECRET, payload, function(error, response, body){
      assert.notEqual(response.statusCode, 200)
      
    })
  });
  
});



describe('queryInvoice()', function(){
  it('should query invoice', function(){
    yellow.queryInvoice(API_KEY, API_SECRET, TEST_INVOICE_ID, function(error, response, body){
      assert.equal(body['id'], TEST_INVOICE_ID);
      assert.equal(body['status'], 'expired');
      assert.equal(body['received'], '0');
      assert.equal(body['invoice_ccy'], 'BTC');
      assert.equal(body['callback'], CALLBACK);
      assert.equal(body['style'], STYLE);
      assert.equal(body['base_ccy'], BASE_CCY);
      assert.equal(body['base_price'], BASE_PRICE);
      assert.equal(body['remaining'], '0.00044228');
      assert.equal(body['invoice_price'], '0.00044228');
      assert.equal(body['expiration'], '2015-06-03T18:37:04.433Z');
      assert.equal(body['invoice_price'], '0.00044228');
      assert.equal(body['url'], '//cdn.yellowpay.co/invoice.9796a76b.html?invoiceId=YBN4YC9FNMCPYMQZY3F8X55W9Y'); 
    })
  });
  
  
  it('should raise authentication error', function(){
    yellow.queryInvoice(DEFAULT_KEY, DEFAULT_SECRET, TEST_INVOICE_ID, function(error, response, body){
      assert.notEqual(response.statusCode, 200);
      })
  });
  
});


describe('verifyIPN()', function(){
  it('should verify IPN', function(){
    body = { 
      'id': 'YBN4YC9FNMCPYMQZY3F8X55W9Y',
      'order': null,
      'url': '//cdn.yellowpay.co/invoice.9796a76b.html?invoiceId=YBN4YC9FNMCPYMQZY3F8X55W9Y',
      'address': '1DGgddiCk9pY6oBwL1GQFSnKAc5ZHubh88',
      'base_price': '0.10000000',
      'base_ccy': 'USD',
      'invoice_price': '0.00044228',
      'invoice_ccy': 'BTC',
      'expiration': '2015-06-03T18:37:04.433Z',
      'server_time': '2015-06-07T21:19:11.072Z',
      'callback': 'https://www.example.com/ipn',
      'status': 'expired',
      'received': '0',
      'remaining': '0.00044228',
      'style': 'cart' 
    }
    
    nonce = (new Date).getTime();
    
    signature = getSignature(body['callback'], body, nonce, API_SECRET)
    
    isVerified = yellow.verifyIPN(API_SECRET, body['callback'], nonce, signature, body)
    assert.ok(isVerified)
  

  });
  
  it('should NOT verify IPN', function(){
    body = { 
      'id': 'YBN4YC9FNMCPYMQZY3F8X55W9Y',
      'order': null,
      'url': '//cdn.yellowpay.co/invoice.9796a76b.html?invoiceId=YBN4YC9FNMCPYMQZY3F8X55W9Y',
      'address': '1DGgddiCk9pY6oBwL1GQFSnKAc5ZHubh88',
      'base_price': '0.10000000',
      'base_ccy': 'USD',
      'invoice_price': '0.00044228',
      'invoice_ccy': 'BTC',
      'expiration': '2015-06-03T18:37:04.433Z',
      'server_time': '2015-06-07T21:19:11.072Z',
      'callback': 'https://www.example.com/ipn',
      'status': 'expired',
      'received': '0',
      'remaining': '0.00044228',
      'style': 'cart' 
    }
    
    nonce = (new Date).getTime();
    signature = getSignature(body['callback'], body, nonce, API_SECRET)
    malicious_nonce = '1433708553718';
    
    isVerified = yellow.verifyIPN(API_SECRET, body['callback'], malicious_nonce, signature, body)
    assert.notOk(isVerified)
  

  });
  
});


function getSignature(url, body, nonce, api_secret){
    var message = nonce.toString() + url + body;
    return crypto.HmacSHA256(message, api_secret).toString();
}
