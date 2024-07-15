const QRCode = require("qrcode");

const generateQrCode = function (url) {
  return new Promise((resolve, reject) => {
    if (!url) {
      return reject(new Error("URL is required"));
    }

    QRCode.toBuffer(url, { type: "png" }, (err, buffer) => {
      if (err) {
        return reject(new Error("QR code generation error"));
      } else {
        resolve(buffer);
      }
    });
  });
};

module.exports = { generateQrCode };
