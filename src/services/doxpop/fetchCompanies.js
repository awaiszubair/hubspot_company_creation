import axios from "axios";
import { HUBSPOT_API_BASE, HUBSPOT_ACCESS_TOKEN } from "../../config/env.js";

export default async function fetchCompanies(filterGroups = [], after) {
  const all = [];
  const properties = ["case_number", "doxpop", "name"];

  try {
    do {
      const payload = {
        filterGroups,
        properties,
        limit: 100,
        sorts: [
          { propertyName: "hs_lastmodifieddate", direction: "DESCENDING" },
        ],
        after,
      };
      const { data } = await axios.post(
        `${HUBSPOT_API_BASE}/crm/v3/objects/companies/search`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      all.push(...data.results);
      after = data.paging?.next?.after;
    } while (after);

    console.log(`✅ Fetched ${all.length} companies from HubSpot`);
    return all;
  } catch (err) {
    console.error(
      "❌ fetchCompanies error:",
      err.response?.data || err.message
    );
    return [];
  }
}
