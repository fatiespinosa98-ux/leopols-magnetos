export type Service = {
  id: string;
  workDetail: string;
  date: string;
  status: "OK" | "Pendiente";
};

export type Magneto = {
  id: string;
  brand: "Bendix" | "Slick";
  serialNumber: string;
  model: string;
  services: Service[];
};
