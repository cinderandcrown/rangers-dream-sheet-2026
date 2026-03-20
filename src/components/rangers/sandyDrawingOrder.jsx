export const SANDY_DRAWING_ORDER = [
  "Brad",
  "Shane",
  "Mary",
  "John P.",
  "JK",
  "Neal",
  "Chrissy",
  "Shane",
  "JK",
  "John R.",
  "Nick",
  "John P.",
  "Nick",
  "Andy",
  "JK",
  "Neal",
  "Shane",
  "Nick",
  "Brad",
  "Shane",
  "Shane",
  "John R.",
];

export const SANDY_DRAWING_ORDER_OPTIONS = [
  {
    value: `0::Sandy`,
    label: `⭐ Sandy (Manager Pick)`,
    subgroupMemberName: "Sandy",
    pickOrder: 0,
  },
  ...SANDY_DRAWING_ORDER.map((name, index) => ({
    value: `${index + 1}::${name}`,
    label: `${index + 1}. ${name}`,
    subgroupMemberName: name,
    pickOrder: index + 1,
  })),
];