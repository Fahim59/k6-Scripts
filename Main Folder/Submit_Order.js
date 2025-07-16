import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,
  iterations: 10,
  
  thresholds: {
    'checks{tag:order_placement}': ['rate>0.95'],
    'checks{tag:delivery_category}': ['rate>0.95'],
    'checks{tag:payment_method}': ['rate>0.95'],
    'checks{tag:order_submission}': ['rate>0.95'],
  },
};

// ===== Parameterized Constants =====
const baseUrl = 'https://ustx000248.florafirebackdev.com';

const customerId = '224D01D3-1CE3-31D3-35AA-3A1A09A59E3E';
const storeId = 'F99B3591-7117-D5C3-1297-3A1A04931C52';
const shopId = '00000000-0000-0000-0000-000000000000';

const defaultHeaders = {
  'Content-Type': 'application/json',
  '__tenant': 'Default',
};

// ===== User Credentials =====
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

export function setup() {
  return userMap;
}

// ===== Utility Functions =====
function formatDate(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

function loginUser(user) {
  const loginPayload = 
    'grant_type=password' +
    `&username=${encodeURIComponent(user.username)}` +
    `&password=${encodeURIComponent(user.password)}` +
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
    '✔️ Login success': (r) => r.status === 200,
    '✔️ Token received': () => token !== undefined,
  });

  return token;
}

function placeOrder(headers, assignedUserId, user) {
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
    shopId: shopId,
    customerId: customerId,
    reviewType: 2,
    employeeId: '001',
    parentOrderId: '',
    assignedUserId,
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
        storeId: storeId,
        subTotal: 5.99,
        sundryFee: 0,
        timeReqFee: 0,
        unitPrice: 5.99,
        weddingFee: 0,
        wireoutFee: 0,
        shopId: shopId,
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
    //'⏱️ < 2s': (r) => r.timings.duration < 2000,
  }, 
  { tag: 'order_placement' });

  const responseJson = res.json();
  const orderId = responseJson?.id;
  const subOrderId = responseJson?.subOrderDtos?.[0]?.id;

  console.log(`👤 ${user.username} -> SubOrder ID: ${subOrderId} -> Order ID: ${orderId}`);

  return res.json();
}

function setDeliveryDetails(headers, subOrderId, user) {
  const today = new Date();
  const twoDaysLater = new Date(today);
  twoDaysLater.setDate(today.getDate() + 2);
  //   deliveryCategory: 3,
  //   recipientId: '5cc4a1c1-8bf8-1d73-a513-3a1a2d852cc9',
  //   createUpdateRecipientDto: {
  //     firstName: 'John',
  //     lastName: 'Smith',
  //     address1: '233 South Wacker Drive',
  //     locationType: 2,
  //     countryId: '568e63fd-b688-4ec0-11a3-3a1a0491a220',
  //     stateProvinceId: '8e472c69-ed4a-f128-6359-3a1a0491de32',
  //     city: 'Chicago',
  //     zipCode: '60606',
  //     phoneNumber: '2124567890',
  //     numberType: 1,
  //     latitude: 41.878909,
  //     longitude: -87.6354884,
  //     customerId
  //   },
  //   createUpdateRecipientDeliveryDetailDto: {
  //     deliveryFromDate: formatDate(today),
  //     deliveryToDate: formatDate(twoDaysLater),
  //     deliveryFeeType: 0,
  //     deliveryType: 3,
  //     deliveryZoneId: '4a62f9aa-8f07-9822-75d4-3a1a09de3e4d',
  //     fulfillingStoreId: storeId,
  //     deliveryFee: "60",
  //     wireServiceId: 0,
  //     relayFee: 0
  //   },
  //   createUpdateRecipientPersonalizationDtos: [
  //     {
  //       recipientName: 'John Smith',
  //       shortCodeId: '6140e2ce-c13f-9bab-3afe-3a1a04919e5c',
  //       cardMessage: 'Best Regards',
  //       subOrderId
  //     }
  //   ]
  // });

  const payload= JSON.stringify({
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
        "customerId": customerId
    },
    "createUpdateRecipientDeliveryDetailDto": {
        "id": "af25d933-e198-f689-1800-3a1a2d852cee",
        "deliveryFromDate": formatDate(today),
        "deliveryToDate": formatDate(twoDaysLater),
        "deliveryFeeType": 0,
        "deliveryType": 3,
        "deliveryZoneId": "4a62f9aa-8f07-9822-75d4-3a1a09de3e4d",
        "fulfillingStoreId": storeId,
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

  const res = http.post(`${baseUrl}/api/app/sub-order/set-shipping-details/${subOrderId}`, payload, { headers });

  check(res, {
    '🚚 Delivery details set': (r) => r.status === 200 || r.status === 201,
    //'⏱️ < 2s': (r) => r.timings.duration < 2000,
  }, 
  { tag: 'delivery_category' });

  console.log(`🚚 ${user.username} - Delivery set for SubOrder: ${subOrderId}`);
}

function applyPayments(headers, orderId) {
  const payments = [
    { method: 2, amount: 3, checkNumber: '1212' },
    { method: 3, amount: 2.99 }
  ];

  payments.forEach(p => {
    const payload = {
      paymentMethod: p.method,
      paidAmount: p.amount,
      orderId,
      customerId,
      paymentMethodAdditionalFee: 0,
      ...(p.method === 2 ? { checkNumber: p.checkNumber } : {})
    };

    const res = http.post(
      `${baseUrl}/api/app/order/apply-payment-to-order/${orderId}`, JSON.stringify(payload), { headers }
    );

    check(res, {
      [`💲 Payment method ${p.method} success`]: (r) => r.status === 200 || r.status === 204,
    }, 
    { tag: 'payment_method' });

    console.log(`💳 Payment done by method ${p.method} for Order ${orderId}`);

    sleep(1);
  });
}

function submitOrder(headers, orderId) {
  const payload = JSON.stringify({
    orderStatus: 3,
    paymentStatus: 3,
    deliveryStatus: 1,
    changeDueAmount: 0
  });

  const res = http.put(`${baseUrl}/api/app/order/order-status/${orderId}`, payload, { headers });

  check(res, {
    '🆗 Order submitted': (r) => r.status === 200 || r.status === 204,
    //'⏱️ < 2s': (r) => r.timings.duration < 2000,
  }, 
  { tag: 'order_submission' });
}

// ===== Main Test =====
export default function (userData) {
  const user = userData[__VU - 1];
  const token = loginUser(user);

  const headers = {
    ...defaultHeaders,
    'Authorization': `Bearer ${token}`
  };

  try {
    const orderRes = placeOrder(headers, user.assignedUserId, user);
    const orderId = orderRes?.id;
    const subOrderId = orderRes?.subOrderDtos?.[0]?.id;

    if (!orderId || !subOrderId) throw new Error('❌ Order or SubOrder ID missing');

    setDeliveryDetails(headers, subOrderId, user);
    applyPayments(headers, orderId);
    submitOrder(headers, orderId);
  } 
  catch (err) {
    console.error(`❌ ${user.username} failed order flow: ${err.message}`);
  }
}