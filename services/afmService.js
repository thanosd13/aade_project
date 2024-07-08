const axios = require("axios");
const xml2js = require("xml2js");
const parser = new xml2js.Parser();

const url = "https://www1.gsis.gr/wsaade/RgWsPublic2/RgWsPublic2";

// Helper function to construct SOAP message
const getSoapMessage = (afm) => {
  return `<env:Envelope xmlns:env="http://www.w3.org/2003/05/soap-envelope" xmlns:ns1="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:ns2="http://rgwspublic2/RgWsPublic2Service" xmlns:ns3="http://rgwspublic2/RgWsPublic2">
        <env:Header>
            <ns1:Security>
                <ns1:UsernameToken>
                    <ns1:Username>${process.env.MHTRWO_USERNAME}</ns1:Username>
                    <ns1:Password>${process.env.MHTRWO_PASSWORD}</ns1:Password>
                </ns1:UsernameToken>
            </ns1:Security>
        </env:Header>
        <env:Body>
            <ns2:rgWsPublic2AfmMethod>
                <ns2:INPUT_REC>
                    <ns3:afm_called_for>${afm}</ns3:afm_called_for>
                    <ns3:as_on_date>2021-07-01</ns3:as_on_date>
                </ns2:INPUT_REC>
            </ns2:rgWsPublic2AfmMethod>
        </env:Body>
    </env:Envelope>`;
};

async function handleSoapResponse(xml) {
  try {
    const result = await parser.parseStringPromise(xml);
    const basicInfo =
      result["env:Envelope"]["env:Body"][0][
        "srvc:rgWsPublic2AfmMethodResponse"
      ][0]["srvc:result"][0]["rg_ws_public2_result_rtType"][0]["basic_rec"][0];
    const firmActTab =
      result["env:Envelope"]["env:Body"][0][
        "srvc:rgWsPublic2AfmMethodResponse"
      ][0]["srvc:result"][0]["rg_ws_public2_result_rtType"][0][
        "firm_act_tab"
      ][0]["item"][0];

    // Appending first item from firm_act_tab to basicInfo
    basicInfo["firm_act"] = {
      firm_act_descr: firmActTab["firm_act_descr"][0],
    };
    return basicInfo;
  } catch (err) {
    throw err;
  }
}

// Function to call SOAP API
const callSoap = async (afm) => {
  const soapMessage = getSoapMessage(afm);
  try {
    const response = await axios.post(process.env.SOAP_ENDPOINT, soapMessage, {
      headers: { "Content-Type": "application/soap+xml; charset=utf-8" },
    });
    console.log(response);
    const data = handleSoapResponse(response.data);
    console.log(data);
    return data;
  } catch (error) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

module.exports = { callSoap };
