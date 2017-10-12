/* Tetration Analytics Rest API Python client */
var request = require('request')
var crypto = require('crypto')

class RestClient {
    /*
      A high-level client class for communication with Tetration API server.
      Provides query requests.

      Attributes:
          server_endpoint: String of server URL to query
          uri_prefix: String prefix of URI Path
          api_key: String of hex API key provided by Tetration key generation UI.
          api_secret: String of hex API secret provided by Tetration key
          generation UI.

      Constants:
          SUPPORTED_METHODS: list of supported HTTP methods
    */

  constructor(server_endpoint, api_key, api_secret, api_version = "v1") {
    /*
      Example use case:
      rc = RestClient("http://example-server-endpoint.com", // server_endpoint
                      "5d2088d1e20da0b8aebbbc5e648df68a", // api_key
                      "315b8f99adc4edbaa4e9b7ef3ef492a349156fce") // api_secret

      Args:
          server_endpoint: String of the server URL to query
          api_key: String of hex API key provided by Tetration key generation UI.
          api_secret: String of hex API secret provided by Tetration key
          generation UI.
          api_version: API Version
    */

    this.SUPPORTED_METHODS = ['GET', 'PUT', 'POST', 'DELETE', 'PATCH']

    this.server_endpoint = server_endpoint
    this.uri_prefix = '/openapi/' + api_version
    this.api_key = api_key
    this.api_secret = api_secret
  }

  signed_http_request(http_method, uri_path, callback,
    {params: params, json_body: json_body, timeout: timeout} = {}) {

    /*
       Send a signed http request to the server. Returns a requests.Response.

       Args:
        http_method: String HTTP method like 'GET', 'PUT', 'POST', ...
        uri_path: Additional string URI path for query
        callback: Function to be invoked on success.
                  Is passed the arguments: (error, response, body)
        options:
        "params": Additional dictionary of parameters for GET and PUT
        "json_body": String JSON body
        "timeout": Integer of timeout in milliseconds

       Returns: null
    */

    if(this.SUPPORTED_METHODS.indexOf(http_method) == -1){
        console.warn('HTTP method "%s" is unsupported. Returning None', http_method)
        return
    }

    var prepared_req = {
      method: http_method,
      url: uri_path,
      params: params,
      json: json_body || true,
      timeout: timeout,
      headers: {
        "User-Agent": "Cisco Tetration Javascript Client",
        "Content-Type": 'application/json',
        "Id": this.api_key
      }
    }

    /*
       Tetration expects a timestamp in the format YYYY-MM-DDTHH:mm:ss+0000
       toISOString returns a timestamp in the foratm YYYY-MM-DDTHH:mm:ss.sssZ

       Get an ISO string timestamp and manipulate it to the Tetration specific format
    */
    const today = new Date()
    var timestamp = today.toISOString().split('.')[0]
    timestamp += '+0000'
    prepared_req.headers['Timestamp'] = timestamp


    if (http_method == 'POST' || http_method == 'PUT') {
      var sha256 = crypto.createHash('sha256')
      sha256.update(JSON.stringify(json_body))
      var checksum = sha256.digest('hex')
      prepared_req.headers['X-Tetration-Cksum'] = checksum
    }

    this.add_auth_header(prepared_req)
    prepared_req.url = this.server_endpoint + uri_path

    console.log(JSON.stringify(prepared_req, null, 2))
    return request(prepared_req, callback)
  }

  add_auth_header(req) {
    /*
      Adds the authorization header to the prepared request object

      Args:
        req: prepared request object for which to update the
        Authorization header.
    */
    var signer = crypto.createHmac('sha256', this.api_secret)

    signer.update(req.method + '\n')
    signer.update(req.url + '\n')
    signer.update((req.headers['X-Tetration-Cksum'] || '') + '\n')
    signer.update((req.headers['Content-Type'] || '') + '\n')
    signer.update((req.headers['Timestamp'] || '') + '\n')

    const signature = signer.digest('base64')

    req.headers["Authorization"] = signature
  }

  get(uri_path = '', callback, options) {
    /*
    GET request to the server. On success callback will be invoked with
    arguments (error, response, body).

    Args:
        uri_path: Additional string URI path for query
        callback: Function to be invoked on success.
                  Is passed the arguments: (error, response, body)
        options:
            params: Additional dictionary of parameters for GET
            timeout: Integer of timeout in milliseconds

    Returns:
        null
    */

    return this.signed_http_request('GET', this.uri_prefix + uri_path, callback, options)
  }

  post(uri_path='', callback, options){
      /*
      POST request to the server. On success callback will be invoked with
      arguments (error, response, body).

      Args:
          uri_path: Additional string URI path for query
          callback: Function to be invoked on success.
                    Is passed the arguments: (error, response, body)
          options:
              json_body: String JSON body
              timeout: Integer of timeout in milliseconds

      Returns:
          null
      */
      return this.signed_http_request('POST', this.uri_prefix + uri_path, callback, options)
  }

  put(uri_path='', callback, options){
      /*
      PUT request to the server. On success callback will be invoked with
      arguments (error, response, body).

      Args:
          uri_path: Additional string URI path for query
          callback: Function to be invoked on success.
                    Is passed the arguments: (error, response, body)
          options:
              json_body: String JSON body
              timeout: Integer of timeout in milliseconds

      Returns:
          null
      */
      return this.signed_http_request('PUT', this.uri_prefix + uri_path, callback, options)
  }

  patch(uri_path='', callback, options){
      /*
      PATCH request to the server. On success callback will be invoked with
      arguments (error, response, body).

      Args:
          uri_path: Additional string URI path for query
          callback: Function to be invoked on success.
                    Is passed the arguments: (error, response, body)
          options:
              json_body: String JSON body
              timeout: Integer of timeout in milliseconds

      Returns:
          null
      */
      return this.signed_http_request('PATCH', this.uri_prefix + uri_path, callback, options)
  }

  delete(uri_path='', callback, options){
      /*
      DELETE request to the server. On success callback will be invoked with
      arguments (error, response, body).

      Args:
          uri_path: Additional string URI path for query
          callback: Function to be invoked on success.
                    Is passed the arguments: (error, response, body)
          options:
              json_body: String JSON body
              timeout: Integer of timeout in milliseconds

      Returns:
          null
      */
      return this.signed_http_request('DELETE', this.uri_prefix + uri_path, callback, options)
  }
}

module.exports = RestClient
