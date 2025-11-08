import axios from "axios";
import { HUBSPOT_API_BASE, HUBSPOT_ACCESS_TOKEN } from "../../config/env.js";

export default async function updateCompany(companyId, properties) {
  try {
    const response = await axios.patch(
      `${HUBSPOT_API_BASE}/crm/v3/objects/companies/${companyId}`,
      { properties },
      {
        headers: {
          Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`✅ HubSpot company ${companyId} updated.`);
    return response.data;
  } catch (error) {
    console.error(
      `❌ Failed to update company ${companyId}:`,
      error.response?.data || error.message
    );
    return null;
  }
}
