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
    if (env === 'testing') {
      return 'https://testing.zippie.com/'
    }
    if (env === 'dev') {
      return 'https://dev.zippie.com/'
    }
    return `https://zippie.com/`
  }

  function getPaymentRequest(paymentData, paymentDataEncoded) {
    const supportedInstruments = [
      {
        supportedMethods: getUrl(paymentData.env),
        data: {
          paymentData: paymentData,
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
      window.open(
        `${getUrl(paymentData.env)}pay.html#pay-fullscreen=${paymentDataEncoded}`,
      )
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
      // const paymentData = {
      //   merchantId: 'test.merchant',
      //   orderId: 'MY_ORDER_ID',
      //   amount: 1.23
      //   currency: 'EUR',
      //   email: my@email.com, (to prefill email field in Zippie Pay UI)
      //   force: 'false' (true will open Zippie Pay UI in new tab instead using Payment Request API even if supported in browser)  
      // }
      const request = new ZippiePaymentRequest({ force: "false", ...paymentData })
      return request
    },
  }
})()
