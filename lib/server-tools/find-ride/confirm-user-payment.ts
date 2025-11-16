import { MOCK_NOW } from "./shared";

type ConfirmUserPaymentArgs = {
  amount: number;
  currency?: string;
};

type ConfirmUserPaymentResult = {
  status: "authorized";
  amount: number;
  currency: string;
  authId: string;
  authorizedAt: string;
};

const confirmUserPayment = async ({
  amount,
  currency,
}: ConfirmUserPaymentArgs): Promise<ConfirmUserPaymentResult> => {
  return {
    status: "authorized",
    amount,
    currency: currency ?? "USD",
    authId: "AUTH-MOCK-0001",
    authorizedAt: MOCK_NOW,
  };
};

export default confirmUserPayment;


