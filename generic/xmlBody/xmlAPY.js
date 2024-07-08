function xmlAPY(vatNumber, series, aa, issueDate, products) {
  let invoiceDetailsXML = "";
  let totalNetValue = 0;
  let totalVatAmount = 0;

  products.forEach((product, index) => {
    totalNetValue += product.netValue;
    totalVatAmount += product.vatAmount;

    invoiceDetailsXML += `
          <invoiceDetails>
              <lineNumber>${index + 1}</lineNumber>
              <netValue>${product.netValue}</netValue>
              <vatCategory>${product.vatCategory}</vatCategory>
              <vatAmount>${product.vatAmount}</vatAmount>
              <incomeClassification>
                  <icls:classificationCategory>category1_95</icls:classificationCategory>
                  <icls:amount>${product.netValue}</icls:amount>
              </incomeClassification>
          </invoiceDetails>
      `;
  });

  return `
  <InvoicesDoc
      xmlns="http://www.aade.gr/myDATA/invoice/v1.0"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xmlns:icls="https://www.aade.gr/myDATA/incomeClassificaton/v1.0"
      xmlns:ecls="https://www.aade.gr/myDATA/expensesClassificaton/v1.0" 
      xsi:schemaLocation="http://www.aade.gr/myDATA/invoice/v1.0/InvoicesDoc-v0.6.xsd">
      <invoice>
          <issuer>
              <vatNumber>${vatNumber}</vatNumber>
              <country>GR</country>
              <branch>1</branch>
          </issuer>
          <invoiceHeader>
              <series>${series}</series>
              <aa>${aa}</aa>
              <issueDate>${issueDate}</issueDate>
              <invoiceType>11.2</invoiceType>
              <currency>EUR</currency>
          </invoiceHeader>
          <paymentMethods>
              <paymentMethodDetails>
                  <type>3</type>
                  <amount>${totalNetValue + totalVatAmount}</amount>
                  <paymentMethodInfo>Payment Method Info...</paymentMethodInfo>
              </paymentMethodDetails>
          </paymentMethods>
          ${invoiceDetailsXML}
          <invoiceSummary>
              <totalNetValue>${totalNetValue}</totalNetValue>
              <totalVatAmount>${totalVatAmount}</totalVatAmount>
              <totalWithheldAmount>0.00</totalWithheldAmount>
              <totalFeesAmount>0.00</totalFeesAmount>
              <totalStampDutyAmount>0.00</totalStampDutyAmount>
              <totalOtherTaxesAmount>0.00</totalOtherTaxesAmount>
              <totalDeductionsAmount>0.00</totalDeductionsAmount>
              <totalGrossValue>${
                totalNetValue + totalVatAmount
              }</totalGrossValue>
              <incomeClassification>
                  <icls:classificationCategory>category1_95</icls:classificationCategory>
                  <icls:amount>${totalNetValue}</icls:amount>
              </incomeClassification>
          </invoiceSummary>
      </invoice>
  </InvoicesDoc>
  `;
}

module.exports = xmlAPY;
