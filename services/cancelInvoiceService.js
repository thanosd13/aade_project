const axios = require("axios");
const xml2js = require("xml2js");
const he = require("he");
const { getHeaders } = require("../generic/getAadeHeaders");

const cancelInvoice = async (invoiceMark) => {
  try {
    const { username, subscription_key } = await getHeaders(id);
    const response = await axios.post(
      process.env.CANCEL_INVOICE_MY_DATA + "mark=" + invoiceMark,
      {
        headers: {
          "Content-Type": "application/xml",
          Accept: "application/xml",
          "aade-user-id": username,
          "ocp-apim-subscription-key": subscription_key,
        },
      }
    );

    const xml = response.data;
    console.log("Original response data:", response.data);

    // Decode HTML entities
    const decodedXml = he.decode(xml);
    console.log("Decoded XML:", decodedXml);

    // Parse the decoded XML
    return new Promise((resolve, reject) => {
      xml2js.parseString(
        decodedXml,
        { explicitArray: false, trim: true },
        async (err, result) => {
          if (err) {
            console.error("Error parsing XML:", err);
            return resolve({ status: 500, error: "Error parsing XML" });
          } else {
            // Log the parsed outer XML result
            console.log("Parsed outer XML:", JSON.stringify(result, null, 2));

            // Access specific elements
            const response = result?.string?.ResponseDoc?.response;

            if (response) {
              const index = response.index;
              const invoiceUid = response.invoiceUid;
              const invoiceMark = response.invoiceMark;
              const qrUrl = response.qrUrl;
              const statusCode = response.statusCode;

              if (statusCode === "Success") {
                return resolve({ status: 200, message: "Success" });
              } else {
                console.error(
                  "Error: response element not found in parsed XML"
                );
                return resolve({
                  status: 400,
                  error: "Response element not found",
                });
              }
            } else {
              return resolve({
                status: 400,
                error: "No response found in XML",
              });
            }
          }
        }
      );
    });
  } catch (error) {
    console.error("Error:", error);
    return { status: 500, error: "Request failed" };
  }
};

module.exports = { cancelInvoice };
