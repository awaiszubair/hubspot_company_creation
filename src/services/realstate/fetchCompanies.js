import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const HUBSPOT_API_BASE = "https://api.hubapi.com";

export async function fetchCompanies(filterGroups = []) {
  const allCompanies = [];
  let after = undefined;

  try {
    do {
      const response = await axios.post(
        `${HUBSPOT_API_BASE}/crm/v3/objects/companies/search`,
        {
          filterGroups,
          properties: [
            "name",
            "address",
            "city",
            "state",
            "automation_completed",
          ],
          limit: 100,
          after,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      allCompanies.push(...response.data.results);
      after = response.data.paging?.next?.after;
    } while (after);

    console.log(`✅ Fetched ${allCompanies.length} companies`);
    return allCompanies;
  } catch (error) {
    console.error(
      "❌ Error fetching companies:",
      error.response?.data || error.message
    );
    return [];
  }
}
