function xmlTimologio(
  vatNumber,
  series,
  aa,
  customerData,
  products,
  invoiceType
) {
  let invoiceDetailsXML = "";
  let totalNetValue = 0;
  let totalVatAmount = 0;
  let classificationCategory = "";
  let classificationType = "";

  const fpa = [
    { value: "0", code: "7" },
    { value: "3", code: "9" },
    { value: "4", code: "6" },
    { value: "6", code: "3" },
    { value: "9", code: "5" },
    { value: "13", code: "2" },
    { value: "17", code: "5" },
    { value: "24", code: "1" },
  ];

  products.forEach((product, index) => {
    totalNetValue += parseFloat(product.price);
    totalVatAmount +=
      parseFloat(product.final_price) - parseFloat(product.price);

    const fpaCode = fpa.find((item) => item.value == product.fpa)?.code || "";

    if (invoiceType == "1.2") {
      classificationCategory = `<icls:classificationCategory>category1_2</icls:classificationCategory>`;
      classificationType = `<icls:classificationType>E3_561_005</icls:classificationType>`;
    } else if (invoiceType == "1.3") {
      classificationCategory = `<icls:classificationCategory>category1_2</icls:classificationCategory>`;
      classificationType = `<icls:classificationType>E3_561_006</icls:classificationType>`;
    } else if (invoiceType == "2.2") {
      classificationCategory = `<icls:classificationCategory>category1_3</icls:classificationCategory>`;
      classificationType = `<icls:classificationType>E3_561_005</icls:classificationType>`;
    } else if (invoiceType == "2.3") {
      classificationCategory = `<icls:classificationCategory>category1_3</icls:classificationCategory>`;
      classificationType = `<icls:classificationType>E3_561_006</icls:classificationType>`;
    }

    invoiceDetailsXML += `
                <invoiceDetails>
                    <lineNumber>${index + 1}</lineNumber>
                    <netValue>${product.price}</netValue>
                    <vatCategory>${fpaCode}</vatCategory>
                    <vatAmount>${(
                      parseFloat(product.final_price) -
                      parseFloat(product.price)
                    ).toFixed(2)}</vatAmount>
                    <vatExemptionCategory>1</vatExemptionCategory>
                    <incomeClassification>
                        ${classificationType}
                        ${classificationCategory}
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
                    <name>${customerData.name}</name>
                    <address>
                        <postalCode>${customerData.postal_code}</postalCode>
                        <city>${customerData.city}</city>
                    </address>
                </counterpart>
                <invoiceHeader>
                    <series>${series}</series>
                    <aa>${aa}</aa>
                    <issueDate>${customerData.date}</issueDate>
                    <invoiceType>${invoiceType}</invoiceType>
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
                    <totalVatAmount>${totalVatAmount.toFixed(
                      2
                    )}</totalVatAmount>
                    <totalWithheldAmount>0.00</totalWithheldAmount>
                    <totalFeesAmount>0.00</totalFeesAmount>
                    <totalStampDutyAmount>0.00</totalStampDutyAmount>
                    <totalOtherTaxesAmount>0.00</totalOtherTaxesAmount>
                    <totalDeductionsAmount>0.00</totalDeductionsAmount>
                    <totalGrossValue>${
                      totalNetValue + totalVatAmount
                    }</totalGrossValue>
                    <incomeClassification>
                        ${classificationType}
                        ${classificationCategory}
                        <icls:amount>${totalNetValue}</icls:amount>
                    </incomeClassification>
                </invoiceSummary>
            </invoice>
        </InvoicesDoc>
        `;
}

module.exports = xmlTimologio;
