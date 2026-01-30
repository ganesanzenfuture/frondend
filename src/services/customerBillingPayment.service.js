import api from "./api";

/* ➕ ADD PAYMENT */
export const addCustomerPayment = (data) => {
  return api.post("/customer-payments", data);
};

/* 📜 PAYMENT HISTORY */
export const getPaymentsByBillingId = (billing_id) => {
  return api.get(`/customer-payments/${billing_id}`);
};

/* 📊 INVOICE + PAID + BALANCE */
export const getInvoiceWithPayments = (billing_id) => {
  return api.get(`/customer-payments/invoice/${billing_id}`);
};
