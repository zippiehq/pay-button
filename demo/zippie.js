const zippie = (function () {
  class ZippiePaymentRequest {
    constructor(paymentData) {
      this.paymentData = paymentData
    }

    async show() {
      try {
        if (!window.PaymentRequest) {
          return openInFullscreen(this.paymentData)
        }

        const supportedInstruments = [
          {
            supportedMethods: 'https://dev.zippie.com',
            //supportedMethods: 'https://klaatu-zippie.ngrok.io',
            data: {
              merchantIdentifier: this.paymentData.merchantId,
              email: this.paymentData.email,
            },
          },
        ]

        const details = {
          // XXX: pass email and merchanId here since method data is currently not coming thought to sw
          id: `${this.paymentData.email}:${this.paymentData.merchantId}`,
          total: {
            label: 'Total',
            amount: {
              currency: this.paymentData.currency,
              value: this.paymentData.amount,
            },
          },
        }

        this.request = new PaymentRequest(supportedInstruments, details)

        let canMakePayment = await this.request.canMakePayment()
        if (!canMakePayment) {
          return openInFullscreen(this.paymentData)
        }

        return new Promise(async (resolve, reject) => {
          this.request
            .show()
            .then(function (response) {
              console.info(response)
              response.complete('success')
              resolve('ok')
              // XXX: What should we return?
              //resolve(response)
            })
            .catch(function (error) {
              console.info(error)
              reject('error')
              //reject(error)
            })
        })
      } catch (e) {
        console.error(e.message)
      }
    }
  }

  function openInFullscreen(paymentData) {
    return new Promise(async (resolve, reject) => {
      // XXX: Focus instead of new window if we have one already?
      // XXX: Redo parmas?
      window.open(
        //`https://klaatu-zippie.ngrok.io/#pay=${paymentData.amount}:${paymentData.currency}:${paymentData.email}:${paymentData.merchantId}`,
        `https://dev.zippie.com/#pay=${paymentData.amount}:${paymentData.currency}:${paymentData.email}:${paymentData.merchantId}`
      )
      // XXX: Send this from Klaatu, Check if window has been closed
      window.onmessage = function (e) {
        if (e.data === 'zippie pay success') {
          resolve('ok')
        }
        if (e.data === 'zippie pay error') {
          reject('error')
        }
      }

      resolve('ok')
    })
  }

  return {
    paymentRequest: function (paymentData) {
      // const paymentData = {
      //   merchantId: 'demo'
      //   country: 'Kenya',
      //   currency: 'KES',
      //   total: {
      //     label: 'Demo total',
      //     amount: 19,
      //   }
      // }
      // XXX: Add options: requestPayerName, requestPayerEmail, forceFullscreenMode, showFee, ... etc?
      const request = new ZippiePaymentRequest(paymentData)
      return request
    },
  }
})()
