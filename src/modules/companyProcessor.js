import fetchCompany from "../services/hubspot/getCompany.js";
import enrichAndCreateContactsByCompany from "../services/enformion/enrichAndCreateContactsByCompany.js";
import processCompanyDoxpop from "../services/doxpop/processCompanyDoxpop.js";
import processCompanyRealEstate from "../services/realstate/processCompanyRealEstate.js";

export async function processCompanyQueue(companyId) {
  try {
    const companyProps = await fetchCompany(companyId);
    if (!companyProps) throw new Error("Company not found");

    const company = { id: companyId, properties: companyProps };

    console.log(`🏢 Processing company: ${companyProps.name || companyId}`);

    // Run all services in parallel — isolated and fault-tolerant
    const results = await Promise.allSettled([
      enrichAndCreateContactsByCompany(company),
      processCompanyDoxpop(company),
      processCompanyRealEstate(company),
    ]);

    // Log results for visibility
    const serviceNames = ["Enformion", "Doxpop", "RealEstate"];
    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        console.log(`✅ ${serviceNames[index]} completed successfully`);
      } else {
        console.error(
          `❌ ${serviceNames[index]} failed: ${
            result.reason?.message || result.reason
          }`
        );
      }
    });

    console.log(`🏁 Completed company: ${companyProps.name || companyId}`);
  } catch (err) {
    console.error(`💥 Error processing company ${companyId}: ${err.message}`);
  }
}
