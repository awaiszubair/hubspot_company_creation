import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const HUBSPOT_API_BASE = "https://api.hubapi.com";

export async function batchUpdateCompanies(updates) {
  const inputs = updates.map(({ id, updates }) => ({
    id,
    properties: updates,
  }));

  try {
    await axios.post(
      `${HUBSPOT_API_BASE}/crm/v3/objects/companies/batch/update`,
      { inputs },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(`✅ Batch updated ${updates.length} companies`);
  } catch (error) {
    console.error(
      "❌ Batch update error:",
      error.response?.data || error.message
    );
  }
}
