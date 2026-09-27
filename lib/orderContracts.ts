import { generateContractText, ContractDetails } from "./contractEngine";
import { LICENSE_CONFIGS, LicenseType } from "./licenses";

export interface PurchasedBeat {
  id: string;
  title: string;
  licenseType: LicenseType;
  price: number;
}

export interface GeneratedContractItem {
  beatId: string;
  beatTitle: string;
  licenseType: LicenseType;
  price: number;
  contractText: string;
  templateUrl: string;
}

export function generateContractsForOrder(
  buyerName: string,
  buyerAlias: string,
  items: PurchasedBeat[],
  orderDate: string = new Date().toUTCString()
): GeneratedContractItem[] {
  return items.map((beat) => {
    const details: ContractDetails = {
      licenseType: beat.licenseType,
      date: orderDate,
      buyerName,
      buyerAlias,
      beatTitle: beat.title,
      price: beat.price,
    };

    return {
      beatId: beat.id,
      beatTitle: beat.title,
      licenseType: beat.licenseType,
      price: beat.price,
      contractText: generateContractText(details),
      templateUrl: LICENSE_CONFIGS[beat.licenseType].templateUrl,
    };
  });
}