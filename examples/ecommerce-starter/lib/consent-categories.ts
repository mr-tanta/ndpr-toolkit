import type { ConsentOption } from "@tantainnovative/ndpr-toolkit";

export const consentCategories: ConsentOption[] = [
  {
    id: "essential",
    label: "Essential",
    description:
      "Required to keep you signed in, hold your cart, and process orders. Cannot be disabled.",
    required: true,
    purpose: "Site operation and order fulfilment under NDPA Section 25(1)(b).",
    defaultValue: true,
  },
  {
    id: "analytics",
    label: "Analytics",
    description:
      "Helps us understand which products and pages are most useful so we can improve the store.",
    required: false,
    purpose: "Aggregate product analytics.",
    defaultValue: false,
  },
  {
    id: "marketing",
    label: "Marketing",
    description:
      "Used to send you offers by email and SMS, and to measure the performance of our ads.",
    required: false,
    purpose: "Direct marketing communications.",
    defaultValue: false,
  },
  {
    id: "personalization",
    label: "Personalization",
    description:
      "Remembers your size, address, and recently viewed items to tailor your experience.",
    required: false,
    purpose: "Storefront personalisation.",
    defaultValue: false,
  },
];
