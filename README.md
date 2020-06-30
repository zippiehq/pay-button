# Zippie Pay (Button)

Integrate Zippie Pay to your website

## Usage

###  npm

e.g. React

```bash
npm install @zippie/pay-button
```

```javascript
import { paymentRequest } from '@zippie/pay-button'
```

```javascript
const paymentData = {
  merchantId: 'test.merchant',
  orderId: 'MY_ORDER_ID',
  amount: 1,
  currency: 'KSH',
}

const request = paymentRequest(paymentData)
const result = await request.show()
```

### html+js

using unpkg.com (@zippie/pay-button version 1.0.0)

```javascript
<script src="https://unpkg.com/@zippie/pay-button@1.0.0/dist/zippie-pay.js"></script>
```

```javascript
const paymentData = {
  merchantId: 'test.merchant',
  orderId: 'MY_ORDER_ID',
  amount: 1,
  currency: 'KSH',
}

const request = zippie.paymentRequest(paymentData)
request
  .show()
  .then(function (result) {
    // Payment succesful
  })
  .catch(function (error) {
    // Payment failed (e.g. cancel)
  })
```