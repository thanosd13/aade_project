const axios = require("axios");
const xmlAPY = require("../generic/xmlBody/xmlAPY");
const { getHeaders } = require("../generic/getAadeHeaders");

const username = "";
const subscription_key = "";

const vatNumber = "158537294";
const series = "A";
const aa = "101";
const issueDate = "2020-04-08";
const netValue1 = 1000.0;
const vatAmount1 = 240.0;
const netValue2 = 500.0;
const vatAmount2 = 120.0;

const sendInvoice = async (id) => {
  const { username, subscription_key } = await getHeaders(id);
  axios
    .post(
      process.env.SEND_INVOICE_MY_DATA,
      xmlAPY(
        vatNumber,
        series,
        aa,
        issueDate,
        netValue1,
        vatAmount1,
        netValue2,
        vatAmount2
      ),
      {
        headers: {
          "Content-Type": "application/xml",
          Accept: "application/xml",
          "aade-user-id": username,
          "ocp-apim-subscription-key": subscription_key,
        },
      }
    )
    .then((response) => {
      console.log("Response:", response.data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};

module.exports = { sendInvoice };
