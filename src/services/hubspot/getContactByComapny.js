import axios from "axios";
import { HUBSPOT_API_BASE, HUBSPOT_ACCESS_TOKEN } from "../../config/env.js";

// Optional: Fetch contacts associated with a company
export default async function getContactsByCompany(companyId) {
  try {
    const response = await axios.get(
      `${HUBSPOT_API_BASE}/crm/v3/associations/companies/contacts/batch/read`,
      {
        headers: { Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}` },
        data: { inputs: [{ id: companyId }] },
      }
    );

    return response.data.results?.[0]?.to || [];
  } catch (err) {
    console.error(
      `❌ Failed to fetch contacts for company ${companyId}:`,
      err.response?.data || err.message
    );
    return [];
  }
}
