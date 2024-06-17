const http = require('http');
const axios = require('axios');

const port = 3001;

// Το URL του web service
const url = 'https://www1.gsis.gr/wsaade/RgWsPublic2/RgWsPublic2';

// Το SOAP μήνυμα
const getSoapMessage = (username, password) => `<env:Envelope xmlns:env="http://www.w3.org/2003/05/soap-envelope" xmlns:ns1="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:ns2="http://rgwspublic2/RgWsPublic2Service" xmlns:ns3="http://rgwspublic2/RgWsPublic2">
<env:Header>
<ns1:Security>
<ns1:UsernameToken>
<ns1:Username>THANOS-1310</ns1:Username>
<ns1:Password>Panathinaikos1310!</ns1:Password>
</ns1:UsernameToken>
</ns1:Security>
</env:Header>
<env:Body>
<ns2:rgWsPublic2AfmMethod>
<ns2:INPUT_REC>
<ns3:afm_called_by/>
<ns3:afm_called_for>158537294</ns3:afm_called_for>
<ns3:as_on_date>2021-07-01</ns3:as_on_date>
</ns2:INPUT_REC>
</ns2:rgWsPublic2AfmMethod>
</env:Body>
</env:Envelope>`; 

const server = http.createServer((req, res) => {
  if (req.url === '/getAfmDetails' && req.method === 'GET') {
    const username = '';
    const password = 'PANATHINAIKOS131096-';

    const soapMessage = getSoapMessage(username, password);

    const config = {
      headers: {
        'Content-Type': 'application/soap+xml; charset=utf-8',
      },
    };

    axios.post(url, soapMessage, config)
      .then(response => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response.data));
      })
      .catch(error => {
        console.error('Error:', error.response ? error.response.data : error.message);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('SOAP method call failed');
      });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
