// import axios from "axios";
// import { HUBSPOT_API_BASE, HUBSPOT_ACCESS_TOKEN } from "../../config/env.js";

// // Fetch single company by ID from HubSpot with retries
// export default async function fetchCompany(companyId, maxRetries = 5) {
//   const baseDelay = 2000;

//   for (let attempt = 1; attempt <= maxRetries; attempt++) {
//     try {
//       const response = await axios.get(
//         `${HUBSPOT_API_BASE}/crm/v3/objects/companies/${companyId}?properties=case_number,name,address,city,state,zip`,
//         {
//           headers: {
//             Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
//             "Content-Type": "application/json",
//           },
//           timeout: 10000,
//         }
//       );

//       const props = response.data.properties || {};
//       if (props.case_number?.trim()) return props;

//       const delay = baseDelay * Math.pow(1.5, attempt - 1);
//       console.log(
//         `⚠️ case_number not ready for ${companyId}, attempt ${attempt}. Waiting ${delay}ms`
//       );
//       await new Promise((r) => setTimeout(r, delay));
//     } catch (err) {
//       const delay = baseDelay * Math.pow(1.5, attempt - 1);
//       console.log(
//         `⚠️ Attempt ${attempt} failed for ${companyId}: ${err.message}. Retrying in ${delay}ms`
//       );
//       if (attempt < maxRetries) await new Promise((r) => setTimeout(r, delay));
//     }
//   }

//   throw new Error(
//     `Unable to fetch company ${companyId} after ${maxRetries} retries.`
//   );
// }

import axios from "axios";
import { HUBSPOT_API_BASE, HUBSPOT_ACCESS_TOKEN } from "../../config/env.js";

// Fetch single company by ID from HubSpot with retries
export default async function fetchCompany(companyId, maxRetries = 5) {
  const baseDelay = 2000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.get(
        `${HUBSPOT_API_BASE}/crm/v3/objects/companies/${companyId}?properties=case_number,name,address,city,state,zip`,
        {
          headers: {
            Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      const props = response.data.properties || {};

      // ✅ Return company data even if case_number is missing
      // Let individual services decide if they need it
      if (props.case_number?.trim() || attempt === maxRetries) {
        return props;
      }

      const delay = baseDelay * Math.pow(1.5, attempt - 1);
      console.log(
        `⚠️ case_number not ready for ${companyId}, attempt ${attempt}/${maxRetries}. Waiting ${delay}ms`
      );
      await new Promise((r) => setTimeout(r, delay));
    } catch (err) {
      // ✅ On last attempt, return null instead of throwing
      if (attempt === maxRetries) {
        console.error(
          `❌ Unable to fetch company ${companyId} after ${maxRetries} retries: ${err.message}`
        );
        return null;
      }

      const delay = baseDelay * Math.pow(1.5, attempt - 1);
      console.log(
        `⚠️ Attempt ${attempt}/${maxRetries} failed for ${companyId}: ${err.message}. Retrying in ${delay}ms`
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  // ✅ Fallback: return null instead of throwing
  return null;
}
