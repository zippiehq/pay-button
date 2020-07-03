/*
 * Copyright (c) 2018-2019 Zippie Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */

const crypto = require('crypto') 

function parseHeader(header, scheme) {
  if (typeof header !== 'string') {
      return null;
  }

  return header.split(',').reduce(
      (accum, item) => {
          const kv = item.split('=');

          if (kv[0] === 't') {
              accum.timestamp = kv[1];
          }

          if (kv[0] === scheme) {
              accum.signatures.push(kv[1]);
          }

          return accum;
      },
      {
          timestamp: -1,
          signatures: [],
      }
  );
}

function secureCompare(a, b) {
  a = Buffer.from(a);
  b = Buffer.from(b);

  // return early here if buffer lengths are not equal since timingSafeEqual
  // will throw if buffer lengths are not equal
  if (a.length !== b.length) {
      return false;
  }

  // use crypto.timingSafeEqual if available (since Node.js v6.6.0),
  // otherwise use our own scmp-internal function.
  if (crypto.timingSafeEqual) {
      return crypto.timingSafeEqual(a, b);
  }

  const len = a.length;
  let result = 0;

  for (let i = 0; i < len; ++i) {
      result |= a[i] ^ b[i];
  }
  return result === 0;
}

const signature = {
  EXPECTED_SCHEME: 'v0',

  _computeSignature: (payload, secret) => {
      return crypto
          .createHmac('sha256', secret)
          .update(payload, 'utf8')
          .digest('hex');
  },

  verifyHeader(payload, header, secret, tolerance) {
      payload = Buffer.isBuffer(payload) ? payload.toString('utf8') : payload;

      // Express's type for `Request#headers` is `string | []string`
      // which is because the `set-cookie` header is an array,
      // but no other headers are an array (docs: https://nodejs.org/api/http.html#http_message_headers)
      // (Express's Request class is an extension of http.IncomingMessage, and doesn't appear to be relevantly modified: https://github.com/expressjs/express/blob/master/lib/request.js#L31)
      if (Array.isArray(header)) {
          throw new Error(
              'Unexpected: An array was passed as a header, which should not be possible for the zippie-signature header.'
          );
      }

      header = Buffer.isBuffer(header) ? header.toString('utf8') : header;

      const details = parseHeader(header, this.EXPECTED_SCHEME);
      console.log(details)
      if (!details || details.timestamp === -1) {
          console.log('error 1')
          throw new Error({
              message: 'Unable to extract timestamp and signatures from header',
              detail: {
                  header,
                  payload,
              },
          });
      }

      if (!details.signatures.length) {
          console.log('error 2')
          throw new Error({
              message: 'No signatures found with expected scheme',
              detail: {
                  header,
                  payload,
              },
          });
      }

      const expectedSignature = this._computeSignature(
          `${details.timestamp}.${payload}`,
          secret
      );

      console.log(details.signatures[0], expectedSignature)
      const signatureFound = secureCompare(details.signatures[0], expectedSignature)

      if (!signatureFound) {
          console.log('error 3')
          throw new Error({
              message:
                  'No signatures found matching the expected signature for payload.',
              detail: {
                  header,
                  payload,
              },
          });
      }

      const timestampAge = Math.floor(Date.now() / 1000) - details.timestamp;

      if (tolerance > 0 && timestampAge > tolerance) {
          console.log('error 4')
          throw new Error({
              message: 'Timestamp outside the tolerance zone',
              detail: {
                  header,
                  payload,
              },
          });
      }

      return true;
  },
}

module.exports = { signature }