import axios from "axios";
import {
  DOXPOP_API_BASE,
  DOXPOP_BASIC_AUTH,
  HUBSPOT_API_BASE,
  HUBSPOT_ACCESS_TOKEN,
} from "../../config/env.js";

// keyword → flag mapping
const keywordFlags = {
  "Assessed SSP": "dismissed",
  "Court Hearing": "sold",
  "Return of Service": "dismissed",
  "Motion Filed": "sold",
  Judgment: "dismissed",
  Settlement: "sold",
  Payment: "sold",
  Default: "dismissed",
  Dismissal: "dismissed",
  Appeal: "dismissed",
};

export default async function processCompanyDoxpop(company) {
  const { id: companyId, properties } = company;
  const caseNumber = properties.case_number?.trim();
  const companyName = properties.name ?? companyId;

  if (!caseNumber)
    return console.log(`⚠️ Skipping ${companyName}: no case_number`);

  try {
    const { data: caseList } = await axios.get(
      `${DOXPOP_API_BASE}/cases.json?case_number=${encodeURIComponent(
        caseNumber
      )}`,
      { headers: { Authorization: `Basic ${DOXPOP_BASIC_AUTH}` } }
    );
    const caseData = caseList?.[0];
    if (!caseData?.minutes_uri)
      return console.log(`⚠️ No minutes_uri for ${companyName}`);

    let minutesUri = caseData.minutes_uri.endsWith(".json")
      ? caseData.minutes_uri
      : caseData.minutes_uri + ".json";
    const { data: minutes } = await axios.get(
      `${DOXPOP_API_BASE}${minutesUri}`,
      { headers: { Authorization: `Basic ${DOXPOP_BASIC_AUTH}` } }
    );

    console.log(
      `📄 Fetched ${minutes.length} minute entries for ${caseNumber}`
    );

    // find first flag
    let matchedFlag = null;
    outer: for (const m of minutes) {
      if (!m.minute_entry_text) continue;
      const txt = m.minute_entry_text.trim().replace(/\s+/g, " ").toLowerCase();
      for (const [keyword, flag] of Object.entries(keywordFlags)) {
        if (txt.includes(keyword.toLowerCase())) {
          matchedFlag = flag;
          break outer; // stop at first match
        }
      }
    }

    if (matchedFlag) {
      await axios.patch(
        `${HUBSPOT_API_BASE}/crm/v3/objects/companies/${companyId}`,
        { properties: { doxpop: matchedFlag } },
        {
          headers: {
            Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(
        `✅ Updated ${companyName} (${caseNumber}) | Flag: ${matchedFlag}`
      );
    } else {
      console.log(`⚠️ No keyword match for ${caseNumber}`);
    }
  } catch (err) {
    console.error(
      `❌ Failed processing ${companyName} (${caseNumber}):`,
      err.response?.data || err.message
    );
  }
}
