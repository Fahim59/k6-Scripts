import http from 'k6/http';
//import { check } from 'k6';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,
  iterations: 10,
  
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    checks: ['rate > 0.95'],
  },
};

// Map of login user + their assignedUserId
const userMap = [
  { username: 'garcia', password: '11!!qqQQ', assignedUserId: 'DB9640E2-B482-1011-5687-3A1AE1D64C93' },
  { username: 'mark', password: '11!!qqQQ', assignedUserId: '0437B8B6-57E3-970F-C5DA-3A1A09CF7E76' },
  { username: 'smith', password: '11!!qqQQ', assignedUserId: '768DCCE1-953C-9246-E119-3A1AE1D8A72D' },
  { username: 'patri', password: '11!!qqQQ', assignedUserId: 'C92F54C5-6B08-A2BF-288F-3A1AE1D72126' },
  { username: 'elizabeth', password: '11!!qqQQ', assignedUserId: '7BCB271C-6D6A-CF4E-970D-3A1AE1D40597' },
  { username: 'rodri', password: '11!!qqQQ', assignedUserId: 'CA49238F-33CA-DF3B-54CF-3A1AE1D6C4A8' },
  { username: 'jenni', password: '11!!qqQQ', assignedUserId: 'E31C1270-CB21-77B2-6929-3A1AE1D28624' },
  { username: 'miller', password: '11!!qqQQ', assignedUserId: '39FF1B43-3766-B4E7-4450-3A1AE1D921F6' },
  { username: 'linda', password: '11!!qqQQ', assignedUserId: '2A7FC866-C2FC-41CC-4436-3A1AE1D569CB' },
  { username: 'wilson', password: '11!!qqQQ', assignedUserId: '1C22DE6E-CD13-3016-4C8D-3A1AE1D39413' },
];

const baseUrl = 'https://ustx000248.florafirebackdev.com';

export function setup() {
  return userMap;
}

export default function (userData) {
  const user = userData[__VU - 1];
  const loginPayload =
    'grant_type=password' +
    '&username=' + encodeURIComponent(user.username) +
    '&password=' + encodeURIComponent(user.password) +
    '&client_id=ClientPortal_App' +
    '&scope=' + encodeURIComponent('offline_access ClientPortal');

  const loginRes = http.post(`${baseUrl}/connect/token`, loginPayload, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      '__tenant': 'Default',
    },
  });

  const token = loginRes.json('access_token');

  check(loginRes, {
    '✔️  Login success': (r) => r.status === 200,
    '✔️  Token received': () => token !== undefined,
  });

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/plain, */*',
    'Authorization': `Bearer ${token}`,
    '__tenant': 'Default',
  };

  const payload = JSON.stringify({
    deliveryFeeTotal: 0,
    deliveryStatus: 1,
    isGiftCardOrder: false,
    isPartialPaymentAllowed: true,
    orderDiscount: 0,
    orderStatus: 7,
    orderTotal: 0,
    orderType: 1,
    paidAmount: 0,
    paymentStatus: 1,
    taxAmount: 0,
    tipAmount: 0,
    discountCodeId: '',
    shopId: '00000000-0000-0000-0000-000000000000',
    customerId: '224D01D3-1CE3-31D3-35AA-3A1A09A59E3E',
    reviewType: 2,
    employeeId: '001',
    parentOrderId: '',
    assignedUserId: user.assignedUserId, // 👈 Dynamic here!
    tipValueTypeId: '',
    createUpdateSubOrderDtos: [
      {
        cutoffFee: 0,
        deliveryFee: 0,
        deliveryStatus: 1,
        designStatus: 2,
        discountAmount: 0,
        expressFee: 0,
        giftCardExpireDate: '',
        isCarryOut: false,
        isCheckout: false,
        isLock: false,
        isTimeRequired: true,
        isWillPickup: false,
        isWireServiceOrder: false,
        orderDetails: 'Elegent pink lily stem',
        priceType: 1,
        productId: '7c393352-1c99-f0b9-674b-3a1a09b79b49',
        qty: 1,
        relayFee: 0,
        retryNumber: 0,
        saleTypeId: 0,
        salesTax: 0,
        storeId: 'F99B3591-7117-D5C3-1297-3A1A04931C52',
        subTotal: 5.99,
        sundryFee: 0,
        timeReqFee: 0,
        unitPrice: 5.99,
        weddingFee: 0,
        wireoutFee: 0,
        recipientId: '',
        specialInstruction: '',
        deliveryFrom: '',
        deliveryTo: '',
        cardMsg: '',
        slotId: '',
        zoneId: '',
        discountId: '',
        shopId: '00000000-0000-0000-0000-000000000000',
        pickupPersonName: '',
        pickupTime: '0001-01-01 00:00:00.0000000',
        occasionTypeValueId: '00000000-0000-0000-0000-000000000000',
        creditReasonValueId: '00000000-0000-0000-0000-000000000000',
        cancelReasonValueId: '00000000-0000-0000-0000-000000000000',
        replaceReasonValueId: '00000000-0000-0000-0000-000000000000',
        wireOrderId: '00000000-0000-0000-0000-000000000000',
        orderId: '157B4925-6B16-73D7-D4C6-3A1B05FBB403',
        deliveryCategory: 1,
        occasionCode: 0
      }
    ]
  });

  const res = http.post(`${baseUrl}/api/app/order`, payload, { headers });

  check(res, {
    '📦 Order placed': (r) => r.status === 200 || r.status === 201,
    '⏱️ < 2s': (r) => r.timings.duration < 2000,
  });

  const responseJson = res.json();
  const orderId = responseJson?.id;
  const subOrderId = responseJson?.subOrderDtos?.[0]?.id;

  console.log(`👤 ${user.username} -> SubOrder ID: ${subOrderId} -> Order ID: ${orderId}`);

   //Add Delivery Category
  function formatDate(date) {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }

  const today = new Date();
  const twoDaysLater = new Date();
  twoDaysLater.setDate(today.getDate() + 2);

  const deliveryFromDate = formatDate(today);
  const deliveryToDate = formatDate(twoDaysLater);

  const deliveryPayload = JSON.stringify({
    "deliveryCategory": 3,
    "recipientId": "5cc4a1c1-8bf8-1d73-a513-3a1a2d852cc9",
    "createUpdateRecipientDto": {
        "firstName": "John",
        "lastName": "Smith",
        "address1": "233 South Wacker Drive",
        "address2": "84th Floor",
        "locationType": 2,
        "countryId": "568e63fd-b688-4ec0-11a3-3a1a0491a220",
        "stateProvinceId": "8e472c69-ed4a-f128-6359-3a1a0491de32",
        "city": "Chicago",
        "zipCode": "60606",
        "attention": "",
        "email": "",
        "phoneNumber": "2124567890",
        "numberType": 1,
        "addressShortCode": null,
        "latitude": "41.878909",
        "longitude": "-87.6354884",
        "customerId": "224d01d3-1ce3-31d3-35aa-3a1a09a59e3e"
    },
    "createUpdateRecipientDeliveryDetailDto": {
        "id": "af25d933-e198-f689-1800-3a1a2d852cee",
        "deliveryFromDate": deliveryFromDate,
        "deliveryToDate": deliveryToDate,
        "deliveryFeeType": 0,
        "deliveryType": 3,
        "deliveryZoneId": "4a62f9aa-8f07-9822-75d4-3a1a09de3e4d",
        "fulfillingStoreId": "f99b3591-7117-d5c3-1297-3a1a04931c52",
        "isTimeRequired": false,
        "deliveryTimeHour": null,
        "deliveryTimeMinute": null,
        "deliveryTimeType": null,
        "specialInstruction": "",
        "deliveryFee": "60.00",
        "wireServiceId": 0,
        "headquarterCode": "",
        "relayFee": 0,
        "wireServiceShopId": null,
        "wireServiceShopCode": null
    },
    "createUpdateRecipientPersonalizationDtos": [
        {
            "id": null,
            "recipientName": "John Smith",
            "shortCodeId": "6140e2ce-c13f-9bab-3afe-3a1a04919e5c",
            "cardMessage": "Best Regards",
            "subOrderId": subOrderId
        }
    ]
  });

  const deliveryRes = http.post(`${baseUrl}/api/app/sub-order/set-shipping-details/${subOrderId}`, deliveryPayload, { headers });

  check(deliveryRes, {
    '🚚 Recipient added': (r) => r.status === 200 || r.status === 201,
    '⏱️ < 2s': (r) => r.timings.duration < 2000,
  });

  console.log(`🚚 ${user.username} - Delivery set for SubOrder: ${subOrderId}`);

  //Add Payment
  const payments = [
    { method: 2, amount: 3, checkNumber: '1212' },
    { method: 3, amount: 2.99 },
  ];

  payments.forEach(p => {
    const paymentPayload = {
      paymentMethod: p.method,
      paidAmount: p.amount,
      orderId: orderId,
      customerId: '224d01d3-1ce3-31d3-35aa-3a1a09a59e3e',
      paymentMethodAdditionalFee: 0,
    };

    if (p.method === 2 && p.checkNumber) {
      paymentPayload.checkNumber = p.checkNumber;
    }

    const paymentRes = http.post(
      `${baseUrl}/api/app/order/apply-payment-to-order/${orderId}`, JSON.stringify(paymentPayload), { headers }
    );

    check(paymentRes, {
      [`💲 Payment method ${p.method} success`]: (r) => r.status === 200 || r.status === 204,
      '⏱️ < 2s': (r) => r.timings.duration < 2000,
    });

    console.log(`💳 Payment done by method ${p.method} for Order ${orderId}`);
  });

  sleep(1);

  //Submit Order
  function retryRequest(requestFn, maxRetries = 3, waitSeconds = 1) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const res = requestFn();
      if (res.status === 200 || res.status === 204) {
        console.log(`✅ Success on attempt ${attempt}`);
        return res;
      }
      console.warn(`⚠️ Attempt ${attempt} failed with status ${res.status}. Retrying in ${waitSeconds}s...`);
      sleep(waitSeconds);
    }
    console.error(`❌ All ${maxRetries} attempts failed.`);
    return null;
  }

  const submitOrderPayload = JSON.stringify({
      orderStatus: 3,
      paymentStatus: 3,
      deliveryStatus: 1,
      changeDueAmount: 0
    });
  
    const submitRes = retryRequest(() => http.put(`${baseUrl}/api/app/order/order-status/${orderId}`, submitOrderPayload, { headers }));

    if (submitRes !== null) {
      check(submitRes, { 
      '🆗 Order successfully submitted': (r) => r.status === 200 || r.status === 204,
      '⏱️ < 2s': (r) => r.timings.duration < 2000,
      });
    } 
    else {
      console.error(`❌ Order submission failed for Order ${orderId}`);
    }
  
    console.log(`✅ ${user.username} - Completed flow for Order: ${orderId}`);
}