import { LICENSE_CONFIGS, LicenseType } from "./licenses";

export interface ContractDetails {
  licenseType: LicenseType;
  date: string; // e.g., "Mon, 12 Mar 2026 14:30:00 GMT"
  buyerName: string;
  buyerAlias?: string;
  beatTitle: string;
  price: string | number;
}

const LEASE_TEMPLATE_TEXT = `MP3/WAV LEASE

THIS LICENSE AGREEMENT is made on {{DATE}} by and between {{BUYER_NAME}} (hereinafter referred to as the "Licensee") also, if applicable, professionally known as {{BUYER_ALIAS}}, and Christopher Clarke-Ezzidio (RAF By Design LTD) (hereinafter referred to as the "Licensor"). Licensor warrants that it controls the mechanical rights in and to the copyrighted musical work entitled {{BEAT_TITLE}} ("Composition") as of and prior to the date first written above. The Composition, including the music thereof, was composed by Christopher Clarke-Ezzidio (RAF By Design LTD) ("Songwriter") managed under the Licensor.

All licenses are non-refundable and non-transferable.

Master Use. The Licensor hereby grants to Licensee a non-exclusive license (this "License") to record vocal synchronization to the Composition partly or in its entirety and substantially in its original form ("Master Recording"). The Licensor maintains the ability to distribute the beat for non-profit uses only. The Licensor also maintains the right to leave the instrumental posted for ad-revenue generating purposes.

Mechanical Rights. The Licensor hereby grants to Licensee a non-exclusive license to use Master Recording in the reproduction, duplication, manufacture, and distribution of phonograph records, cassette tapes, compact disk, digital downloads, other miscellaneous audio and digital recordings, and any lifts and versions thereof (collectively, the "Recordings", and individually, a "Recording") worldwide for up to the pressing or selling a total of One Thousand (1000) copies of such Recordings or any combination of such Recordings, conditioned upon the payment to the Licensor a sum of {{PRICE}} Pounds (£{{PRICE}}) receipt of which is confirmed. Additionally, licensee shall be permitted to distribute 3 free internet downloads or streams for non-profit and non-commercial use. This license allows up to Ten Thousand (10000) monetized audio streams to sites like (Spotify, RDIO, Rhapsody) but is not eligible for monetization on YouTube.

Performance Rights. The Licensor hereby grants to Licensee a non-exclusive license to use the Master Recording in Unlimited non-profit performances, shows, or concerts. Licensee may not receive compensation from performances with this license.

Synchronization Rights. The Licensor hereby grants limited synchronization rights for One (1) music video streamed online (YouTube, Vimeo, etc.) for up to 10,000 non-monetized video streams on all total sites. A separate synchronization license will need to be purchased for distribution of video to Television, Film or Video games.

Broadcast Rights. The Licensor hereby grants to Licensee broadcasting rights up to 0 Radio Stations.

Credit. Licensee shall acknowledge the original authorship of the Composition appropriately and reasonably in all media and performance formats under the name "(RAF By Design Ltd)" in writing where possible and vocally otherwise.

Consideration. In consideration for the rights granted under this agreement, Licensee shall pay to licensor the sum of £{{PRICE}} pounds and other good and valuable consideration, payable to "Christopher Clarke-Ezzidio (RAF By Design Ltd)", receipt of which is hereby acknowledged. If the Licensee fails to account to the Licensor, timely complete the payments provided for hereunder, or perform its other obligations hereunder, including having insufficient bank balance, the licensor shall have the right to terminate License upon written notice to the Licensee. Such termination shall render the recording, manufacture and/or distribution of Recordings for which monies have not been paid subject to and actionable infringements under applicable law, including, without limitation, the United States Copyright Act, as amended.

Indemnification. Accordingly, Licensee agrees to indemnify and hold Licensor harmless from and against any and all claims, losses, damages, costs, expenses, including, without limitation, reasonable attorney's fees, arising out of or resulting from a claimed breach of any of Licensee's representations, warranties or agreements hereunder.

Audio Samples. 3rd party sample clearance is the responsibility of the licensee.

Miscellaneous. This license is non-transferable and is limited to the Composition specified above, does not convey or grant any right of public performance for profit, constitutes the entire agreement between the Licensor and the Licensee relating to the Composition, and shall be binding upon both the Licensor and the Licensee and their respective successors, assigns, and legal representatives.

Governing Law. This License is governed by and shall be construed under the law of the UK Governing Body, without regard to the conflicts of laws principles thereof.

Term. Executed by the Licensor and the Licensee, to be effective as for all purposes as of the Effective Date first mentioned above and shall continue in perpetuity.`;

const EXCLUSIVE_TEMPLATE_TEXT = `EXCLUSIVE RIGHTS LICENSE AGREEMENT

THIS LICENSE AGREEMENT is made on {{DATE}} ("Effective Date") by and between {{BUYER_NAME}} (hereinafter referred to as the "Licensee") also, if applicable, professionally known as {{BUYER_ALIAS}}, and Christopher Clarke-Ezzidio (RAF By Design LTD) (hereinafter referred to as the "Licensor"). Licensor warrants that it controls the mechanical rights in and to the copyrighted musical work entitled {{BEAT_TITLE}} ("Composition") as of and prior to the date first written above. The Composition, including the music thereof, was composed by Christopher Clarke-Ezzidio (RAF By Design LTD) ("Songwriter") managed under the Licensor.

All licenses are non-refundable and non-transferable.

Master Use. The Licensor hereby grants to Licensee an exclusive license (this "License") to record vocal synchronization to the Composition partly or in its entirety and substantially in its original form ("Master Recording"). The Licensor maintains the ability to distribute the beat for non-profit uses only. The Licensor also maintains the right to leave the instrumental posted for ad-revenue generating purposes.

Mechanical Rights. The Licensor hereby grants to Licensee an exclusive license to use Master Recording in the reproduction, duplication, manufacture, and distribution of phonograph records, cassette tapes, compact disk, digital downloads, other miscellaneous audio and digital recordings, and any lifts and versions thereof (collectively, the "Recordings", and individually, a "Recording") worldwide for unlimited copies of such Recordings or any combination of such Recordings, conditioned upon the payment to the Licensor a sum of {{PRICE}} Pounds (£{{PRICE}}), receipt of which is confirmed. Additionally, Licensee shall be permitted to distribute unlimited internet downloads for non-profit and non-commercial use.

Performance Rights. The Licensor hereby grants to Licensee an exclusive license to use the Master Recording in unlimited for-profit performances, shows, or concerts.

Broadcast Rights. The Licensor hereby grants to Licensee an exclusive license to broadcast or air the Master Recording on an unlimited amount of radio stations.

Credit. Licensee shall acknowledge the original authorship of the Composition appropriately and reasonably in all media and performance formats under the name "(RAF By Design)" in writing where possible and vocally otherwise. Licensee shall also acknowledge the Licensor in the title of the track in every instance of publication with "(Prod. by rafbydesign)". Licensee shall also acknowledge the Licensor on any social media use of the track with @rafbydesign.

Synchronization Rights. Licensee may exploit and monetize from Licensee's unique derived work(s) of Composition for use on TV, Film, Video games or other synchronous projects. Licensee may represent other publishing owners of the original composition for exploitation and have full authority of granting non-exclusive licenses for synchronization use as long as credit and publishing information is provided to such agency.

Publishing Ownership. The publishing rights in and to the Composition shall be owned and split as follows:
- {{BUYER_NAME}} / {{BUYER_ALIAS}}: 50% Publishing Rights
- Christopher Clarke-Ezzidio (RAF By Design Ltd): 50% Publishing Rights

Consideration. In consideration for the rights granted under this agreement, Licensee shall pay to Licensor the sum of {{PRICE}} Pounds (£{{PRICE}}) and other good and valuable consideration, payable to "Christopher Clarke-Ezzidio (RAF By Design Ltd)", receipt of which is hereby acknowledged. If the Licensee fails to account to the Licensor, timely complete the payments provided for hereunder, or perform its other obligations hereunder, including having insufficient bank balance, the Licensor shall have the right to terminate License upon written notice to the Licensee. Such termination shall render the recording, manufacture and/or distribution of Recordings for which monies have not been paid subject to and actionable infringements under applicable law, including, without limitation, the Copyright, Designs and Patents Act 1988, as amended.

Indemnification. Accordingly, Licensee agrees to indemnify and hold Licensor harmless from and against any and all claims, losses, damages, costs, expenses, including, without limitation, reasonable attorney's fees, arising out of or resulting from a claimed breach of any of Licensee's representations, warranties or agreements hereunder.

Audio Samples. 3rd party sample clearance is the responsibility of the Licensee.

Miscellaneous. This license is non-transferable and is limited to the Composition specified above, constitutes the entire agreement between the Licensor and the Licensee relating to the Composition, and shall be binding upon both the Licensor and the Licensee and their respective successors, assigns, and legal representatives.

Governing Law. This License is governed by and shall be construed under the law of the UK Governing Body, without regard to the conflicts of laws principles thereof.

Term. Executed by the Licensor and the Licensee, to be effective as for all purposes as of the Effective Date first mentioned above and shall continue in perpetuity.`;

export function generateContractText(details: ContractDetails): string {
  const template =
    details.licenseType === "exclusive"
      ? EXCLUSIVE_TEMPLATE_TEXT
      : LEASE_TEMPLATE_TEXT;

  return template
    .replaceAll("{{DATE}}", details.date)
    .replaceAll("{{BUYER_NAME}}", details.buyerName)
    .replaceAll("{{BUYER_ALIAS}}", details.buyerAlias || details.buyerName)
    .replaceAll("{{BEAT_TITLE}}", details.beatTitle)
    .replaceAll("{{PRICE}}", String(details.price));
}