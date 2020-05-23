// Demo example of Zippie Pay

document.getElementById('buyButton').addEventListener('click', onBuyClicked)

function onBuyClicked() {
  const paymentData = {
    merchantId: 'demo',
    amount: document.getElementById('amount').value,
    currency: 'KSH',
    email: document.getElementById('email').value,
  }

  if (paymentData.amount === '' || paymentData.email === '') {
    info('Enter email and amount')
    return
  }

  try {
    const request = zippie.paymentRequest(paymentData)
    request
      .show()
      .then(function (result) {
        console.log('zippie.paymentRequest result', result)
        info(result)
      })
      .catch(function (error) {
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
