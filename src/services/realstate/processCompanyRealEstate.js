import updateCompany from "../hubspot/updateCompany.js";
import { processChunk } from "./processChunk.js";

/**
 * Process a single company's RealEstate data.
 * @param {Object} company - HubSpot company object with { id, properties }
 */
export default async function processCompanyRealEstate(company) {
  console.log(`🏠 [RealEstate] Processing company: ${company.properties.name}`);

  try {
    // Reuse processChunk (it already handles RealEstate enrichment for multiple companies)
    const results = await processChunk([company]);

    const result = results[0];
    if (result.status === "fulfilled" && result.value.success) {
      console.log(
        `✅ [RealEstate] Success for ${company.properties.name || company.id}`
      );

      await updateCompany(result.value.id, result.value.updates);
    } else {
      console.warn(
        `⚠️ [RealEstate] Failed for ${company.properties.name || company.id}: ${
          result.value?.reason || "Unknown"
        }`
      );
    }
  } catch (error) {
    console.error(
      `❌ [RealEstate] Error for ${company.properties.name || company.id}:`,
      error.message
    );
  }
}
