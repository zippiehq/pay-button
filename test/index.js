// Demo example of Zippie Pay API

document.getElementById('buyButton').addEventListener('click', onBuyClicked)

function onBuyClicked() {
  // Get user input data
  const paymentData = {
    // MerchantId must be an Ethereum Address (public key) you own (you posses the private key)
    // it can also be a Zippie ENS name for this address
    merchantId: 'demo.zippie',
    orderId: 'YOUR_ORDER_ID',
    amount: document.getElementById('amount').value,
    currency: document.getElementById('currency').value.toUpperCase(),
    email: document.getElementById('email').value,
    env: document.getElementById('env').value,
    force: document.getElementById('force').value,
  }

  if (paymentData.amount === '' || paymentData.email === '') {
    info('Enter email and amount')
    return
  }

  try {
    // Call Zippie Pay API (Chrome/Android will open popup using Payment Request API, Safari/iOS will open a new tab in fullscreen)
    const request = zippie.paymentRequest(paymentData)
    request
      .show()
      .then(function (result) {
        // Payment succesful
        console.log('zippie.paymentRequest result', result)
        info(result)
      })
      .catch(function (error) {
        // Payment failed (e.g. cancel)
        console.error('zippie.paymentRequest error', error)
        info(error)
      })
  } catch (error) {
    console.error(error.message)
  }
}

function info(msg) {
  let element = document.createElement('pre')
  element.innerHTML = msg
  element.className = 'info'
  document.getElementById('msg').appendChild(element)
}
