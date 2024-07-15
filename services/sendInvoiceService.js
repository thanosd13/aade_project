const axios = require("axios");
const xml2js = require("xml2js");
const he = require("he");
const xmlAPY = require("../generic/xmlBody/xmlAPY");
const xmlTimologio = require("../generic/xmlBody/xmlTimologio");
const xmlTimologioEndokoinwtikes = require("../generic/xmlBody/xmlTimologioEndoikoinwtikes");
const model = require("../models/index");
const { getHeaders } = require("../generic/getAadeHeaders");

const sendInvoice = async (
  newInvoiceId,
  id,
  afm,
  serie,
  serial_number,
  customerData,
  products,
  invoiceType,
  invoice_mark,
  date
) => {
  let xmlRequest = {};

  if (invoiceType == "11.2") {
    xmlRequest = xmlAPY(
      afm,
      serie,
      serial_number,
      customerData,
      products,
      invoiceType,
      date
    );
  } else if (
    invoiceType == "1.1" ||
    invoiceType == "1.4" ||
    invoiceType == "1.6" ||
    invoiceType == "2.1" ||
    invoiceType == "2.4" ||
    invoiceType == "5.1" ||
    invoiceType == "5.2" ||
    invoiceType == "6.1" ||
    invoiceType == "6.2" ||
    invoiceType == "7.1" ||
    invoiceType == "8.1" ||
    invoiceType == "8.2"
  ) {
    xmlRequest = xmlTimologio(
      afm,
      serie,
      serial_number,
      customerData,
      products,
      invoiceType,
      invoice_mark,
      date
    );
  } else if (
    invoiceType == "1.2" ||
    invoiceType == "1.3" ||
    invoiceType == "2.2" ||
    invoiceType == "2.3"
  ) {
    xmlRequest = xmlTimologioEndokoinwtikes(
      afm,
      serie,
      serial_number,
      customerData,
      products,
      invoiceType,
      date
    );
  }
  try {
    const { username, subscription_key } = await getHeaders(id);
    const response = await axios.post(
      process.env.SEND_INVOICE_MY_DATA,
      xmlRequest,
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
                try {
                  const newMyDataInvoice = await model.myDataNewInvoice.create({
                    invoice_uid: invoiceUid,
                    invoice_mark: invoiceMark,
                    qr_url: qrUrl,
                    invoice_id: newInvoiceId,
                    userId: id,
                  });
                  console.log(newMyDataInvoice);
                  return resolve({ status: 201, data: newMyDataInvoice });
                } catch (error) {
                  console.log(error);
                  return resolve({
                    status: 500,
                    error: "Error saving invoice",
                  });
                }
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

module.exports = { sendInvoice };
