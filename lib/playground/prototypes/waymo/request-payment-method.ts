type PaymentMethod = "apple_pay" | "google_pay" | "card";

type RequestPaymentMethodArgs = {
  preferred?: PaymentMethod;
};

type PaymentInstrument =
  | { type: "card"; brand: "Visa"; last4: "4242" }
  | { type: Exclude<PaymentMethod, "card"> };

type RequestPaymentMethodResult = {
  selected: PaymentMethod;
  instrument: PaymentInstrument;
};

export const requestPaymentMethod = async ({
  preferred,
}: RequestPaymentMethodArgs): Promise<RequestPaymentMethodResult> => {
  const selected = preferred ?? "card";
  const instrument: PaymentInstrument =
    selected === "card"
      ? { type: "card", brand: "Visa", last4: "4242" }
      : { type: selected };

  return {
    selected,
    instrument,
  };
};
