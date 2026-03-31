const abigail = "/assets/images/avatars/abigail.svg";
const manuel = "/assets/images/avatars/manuel.svg";
const gracie = "/assets/images/avatars/gracie.svg";
const prince = "/assets/images/avatars/prince.svg";
const lukas = "/assets/images/avatars/lukas.svg";

export interface QuickTransfer {
  id: string | number;
  name: string;
  avatar: string;
}

export const quickTransfers: QuickTransfer[] = [
  { id: 1, name: "Abigail", avatar: abigail },
  { id: 2, name: "Manuel", avatar: manuel },
  { id: 3, name: "Gracie", avatar: gracie },
  { id: 4, name: "Prince", avatar: prince },
  { id: 5, name: "Lukas", avatar: lukas },
];
