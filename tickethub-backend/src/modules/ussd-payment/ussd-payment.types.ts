export interface PaymentWebhookNalo {
  order_id: string;
  status: string;
  amount: string;
  charges: string;
  transaction_fee: string;
}

export interface PaymentWebhook {
  event: "charge.success";
  data: any;
}

export interface PaymentCollection {
  merchant_id: string;
  service_name: "MOMO_TRANSACTION" | null;
  trans_hash: string;
  account_name: string;
  description: string;
  reference: string;
  network: "MTN" | "TELECEL" | "VODAFONE" | "AIRTELTIGO"; //ts from my brain take a look at the docs
  amount: number;
  callback: string;
}

export interface PaystackPaymentFields {
  amount: number;
  email: string;
  currency: string;
  mobile_money: {
    phone: string;
    provider: "mtn" | "vod" | "atl";
  };
  metadata: {
    phoneNumber: string;
    receiveNumber: string | undefined;
  };
}

// {
//   event: 'charge.success',
//   data: {
//     id: 6359533073,
//     domain: 'test',
//     status: 'success',
//     reference: '6a177o6135f63ds',
//     amount: 100,
//     message: null,
//     gateway_response: 'Approved',
//     paid_at: '2026-07-15T10:45:01.000Z',
//     created_at: '2026-07-15T10:45:00.000Z',
//     channel: 'mobile_money',
//     currency: 'GHS',
//     ip_address: '154.160.2.165, 172.70.190.161, 172.31.68.120',
//     metadata: 0,
//     fees_breakdown: null,
//     log: null,
//     fees: 2,
//     fees_split: null,
//     authorization: {
//       authorization_code: 'AUTH_0d4kvmkeoi',
//       bin: '055XXX',
//       last4: 'X987',
//       exp_month: '12',
//       exp_year: '9999',
//       channel: 'mobile_money',
//       card_type: '',
//       bank: 'MTN',
//       country_code: 'GH',
//       brand: 'Mtn',
//       reusable: false,
//       signature: null,
//       account_name: null,
//       receiver_bank_account_number: null,
//       receiver_bank: null
//     },
//     customer: {
//       id: 382693123,
//       first_name: null,
//       last_name: null,
//       email: 'mytest@email.com',
//       customer_code: 'CUS_d7a5owqa8vxsvlv',
//       phone: null,
//       metadata: null,
//       risk_action: 'default',
//       international_format_phone: null
//     },
//     plan: {},
//     subaccount: {},
//     split: {},
//     order_id: null,
//     paidAt: '2026-07-15T10:45:01.000Z',
//     requested_amount: 100,
//     pos_transaction_data: null,
//     source: {
//       type: 'api',
//       source: 'merchant_api',
//       entry_point: 'transaction_initialize',
//       identifier: null
//     }
//   }
// }
