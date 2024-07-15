function xmlTimologio(
  vatNumber,
  series,
  aa,
  customerData,
  products,
  invoiceType,
  invoice_mark,
  date
) {
  let invoiceDetailsXML = "";
  let totalNetValue = 0;
  let totalVatAmount = 0;
  let classificationType = "";
  let classificationCategory = "";
  let correlatedInvoices = "";

  const fpa = [
    { value: "-", code: "8" },
    { value: "0", code: "7" },
    { value: "3", code: "9" },
    { value: "4", code: "6" },
    { value: "6", code: "3" },
    { value: "9", code: "5" },
    { value: "13", code: "2" },
    { value: "17", code: "5" },
    { value: "24", code: "1" },
  ];

  if (
    invoiceType == "1.1" ||
    invoiceType == "1.6" ||
    invoiceType == "5.1" ||
    invoiceType == "5.2" ||
    invoiceType == "7.1"
  ) {
    classificationType = "E3_561_001";
    classificationCategory = "category1_2";
  } else if (invoiceType == "1.4") {
    classificationType = "E3_881_001";
    classificationCategory = "category1_7";
  } else if (
    invoiceType == "2.1" ||
    invoiceType == "2.4" ||
    invoiceType == "8.1"
  ) {
    classificationType = "E3_561_001";
    classificationCategory = "category1_3";
  } else if (invoiceType == "6.1" || invoiceType == "6.2") {
    classificationType = "E3_595";
    classificationCategory = "category1_6";
  } else if (invoiceType == "8.2") {
    classificationType = "E3_881_001";
    classificationCategory = "category1_7";
  }

  if (
    invoiceType == "1.6" ||
    invoiceType == "2.4" ||
    invoiceType == "5.1" ||
    invoiceType == "5.2"
  ) {
    correlatedInvoices = `<correlatedInvoices>${invoice_mark}</correlatedInvoices>`;
  }

  products.forEach((product, index) => {
    totalNetValue += parseFloat(product.price);
    totalVatAmount +=
      parseFloat(product.final_price) - parseFloat(product.price);

    const fpaCode = fpa.find((item) => item.value == product.fpa)?.code || "";

    invoiceDetailsXML += `
            <invoiceDetails>
                <lineNumber>${index + 1}</lineNumber>
                <netValue>${product.price}</netValue>
                <vatCategory>${fpaCode}</vatCategory>
                <vatAmount>${(
                  parseFloat(product.final_price) - parseFloat(product.price)
                ).toFixed(2)}</vatAmount>
                <incomeClassification>
                    <icls:classificationType>${classificationType}</icls:classificationType>
                    <icls:classificationCategory>${classificationCategory}</icls:classificationCategory>
                    <icls:amount>${parseFloat(product.price).toFixed(
                      2
                    )}</icls:amount>
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
            <counterpart>
                <vatNumber>${customerData.afm}</vatNumber>
                <country>${customerData.country}</country>
                <branch>${parseInt(customerData.street_number)}</branch>
                <address>
                    <postalCode>${customerData.postal_code}</postalCode>
                    <city>${customerData.city}</city>
                </address>
            </counterpart>
            <invoiceHeader>
                <series>${series}</series>
                <aa>${aa}</aa>
                <issueDate>${date}</issueDate>
                <invoiceType>${invoiceType}</invoiceType>
                <currency>EUR</currency>
                ${correlatedInvoices}
            </invoiceHeader>
            <paymentMethods>
                <paymentMethodDetails>
                    <type>3</type>
                    <amount>${(totalNetValue + totalVatAmount).toFixed(
                      2
                    )}</amount>
                    <paymentMethodInfo>Payment Method Info...</paymentMethodInfo>
                </paymentMethodDetails>
            </paymentMethods>
            ${invoiceDetailsXML}
            <invoiceSummary>
                <totalNetValue>${totalNetValue}</totalNetValue>
                <totalVatAmount>${totalVatAmount.toFixed(2)}</totalVatAmount>
                <totalWithheldAmount>0.00</totalWithheldAmount>
                <totalFeesAmount>0.00</totalFeesAmount>
                <totalStampDutyAmount>0.00</totalStampDutyAmount>
                <totalOtherTaxesAmount>0.00</totalOtherTaxesAmount>
                <totalDeductionsAmount>0.00</totalDeductionsAmount>
                <totalGrossValue>${(totalNetValue + totalVatAmount).toFixed(
                  2
                )}</totalGrossValue>
                <incomeClassification>
                    <icls:classificationType>${classificationType}</icls:classificationType>
                    <icls:classificationCategory>${classificationCategory}</icls:classificationCategory>
                    <icls:amount>${totalNetValue}</icls:amount>
                </incomeClassification>
            </invoiceSummary>
        </invoice>
    </InvoicesDoc>
    `;
}

module.exports = xmlTimologio;
