declare module "japan-address-autofill" {
  interface AddressResult {
    prefecture: string;
    city: string;
    area: string;
  }

  export function getAddressByZip(postalCode: string): Promise<AddressResult | null>;
}
