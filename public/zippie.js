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
            supportedMethods: 'https://testing.zippie.com',
            data: {
              merchantId: this.paymentData.merchantId,
              orderId: this.paymentData.orderId,
              email: this.paymentData.email,
            },
          },
        ]

        const details = {
          id: this.paymentData.orderId,
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

  function openInFullscreen(paymentData) {
    return new Promise(async (resolve, reject) => {
      // XXX: Focus instead of new window if we have one already?
      window.open(
        `https://testing.zippie.com/#pay-fullscreen=${paymentData.merchantId}/${paymentData.orderId}/${paymentData.amount}/${paymentData.currency}/${paymentData.email}`,
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
