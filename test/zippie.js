const zippie = (function () {
  class ZippiePaymentRequest {
    constructor(paymentData) {
      this.paymentData = paymentData
      this.paymentDataEncoded = window.btoa(JSON.stringify(paymentData))
    }

    async show() {
      try {

        if (!window.PaymentRequest) {
          return openInFullscreen(this.paymentData, this.paymentDataEncoded)
        }
        
        const { supportedInstruments, details } = getPaymentRequest(this.paymentData, this.paymentDataEncoded)
        this.request = new PaymentRequest(supportedInstruments, details)

        let canMakePayment = await this.request.canMakePayment()
        if (!canMakePayment || this.paymentData.force !== "false") {
          return openInFullscreen(this.paymentData, this.paymentDataEncoded )
        }

        return new Promise(async (resolve, reject) => {
          this.request.show().then(function (response) {
            console.info(response)
            response.complete('success')
            resolve(response)
          }).catch(function (error) {
            console.info(error)
            reject(error)
          })
        })
      } catch (e) {
        console.error(e.message)
      }
    }
  }

  function getUrl(env) {
    if (env === 'localhost') {
      return 'https://localhost:8443'
    }
    return `https://${env}.zippie.com/`
  }

  function getPaymentRequest(paymentData, paymentDataEncoded) {
    const supportedInstruments = [
      {
        supportedMethods: getUrl(paymentData.env),
        data: {
          paymentData: paymentData, // XXX: Remove?
          paymentDataEncoded: paymentDataEncoded
        },
      },
    ]

    const details = {
      id: paymentData.orderId,
      total: {
        label: 'Total',
        amount: {
          currency: paymentData.currency,
          value: paymentData.amount,
        },
      },
    }

    return { supportedInstruments, details }
  }

  function openInFullscreen(paymentData, paymentDataEncoded) {
    return new Promise(async (resolve, reject) => {
      // XXX: Focus instead of new window if we have one already?
      window.open(
        `${getUrl(paymentData.env)}/pay.html#pay-fullscreen=${paymentDataEncoded}`,
      )
      // Wait for response
      // XXX: Also check if window has been closed manually?
      window.onmessage = function (e) {
        if (e.data.status === 'ok') {
          resolve(e.data)
          return
        }
        reject(e.data)
      }
    })
  }

  return {
    paymentRequest: function (paymentData) {
      // XXX: Validate data
      // const paymentData = {
      //   merchantId: 'demo.zippie',
      //   orderId: '000001',
      //   amount: 1.23 (two decimals => send as 123?)
      //   currency: 'EUR',
      //   email: my@email.com, (prefill email field in UI)
      //   paymentMethods: ['mpesa', 'zippie', 'creditcard'],
      //   orderDetails: [
      //    { label: 'T-shirt', value: '100 KSH' },
      //    { label: 'Fee', value: '5 KSH' },
      //   ],
      //   options: { requestPayerName: true, requestPayerEmail: true, forceFullscreenMode: false }, (move to merchant setting)
      // }

      const request = new ZippiePaymentRequest(paymentData)
      return request
    },
  }
})()
