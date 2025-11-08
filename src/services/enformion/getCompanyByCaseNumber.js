import { HUBSPOT_API_BASE, HUBSPOT_ACCESS_TOKEN } from "../../config/env.js";
import { axiosPostWithRetry } from "../../utils/axiosRetry.js";

export default async function getCompanyByCaseNumber(caseNumber) {
  try {
    const response = await axiosPostWithRetry(
      `${HUBSPOT_API_BASE}/crm/v3/objects/companies/search`,
      {
        filterGroups: [
          {
            filters: [
              {
                propertyName: "case_number",
                operator: "EQ",
                value: caseNumber,
              },
            ],
          },
        ],
        properties: [
          "name",
          "domain",
          "case_number",
          "owner_first_name",
          "owner_last_name",
          "address",
          "city",
          "state",
          "zip",
        ],
      },
      {
        Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      }
    );

    const company = response.results?.[0];
    if (!company) {
      console.log("❌ No company found for case number:", caseNumber);
      return null;
    }

    console.log("✅ Company found:", company.properties.name);
    return company;
  } catch (error) {
    console.error(
      "❌ Error fetching company:",
      error.response?.data || error.message
    );
    return null;
  }
}
