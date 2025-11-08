import { ENFORMION_AP_NAME, ENFORMION_AP_PASSWORD } from "../../config/env.js";
import { axiosPostWithRetry } from "../../utils/axiosRetry.js";

export default async function getContactsByAddress(addressLine1, addressLine2) {
  console.log("🏠 Searching Enformion by Address:", addressLine1, addressLine2);
  try {
    const payload = {
      AddressLine1: addressLine1.trim(),
      AddressLine2: addressLine2.trim(),
      ExactMatch: "CurrentResident",
    };

    const res = await axiosPostWithRetry(
      "https://devapi.enformion.com/Address/Id",
      payload,
      {
        "galaxy-ap-name": ENFORMION_AP_NAME,
        "galaxy-ap-password": ENFORMION_AP_PASSWORD,
        "galaxy-client-session-id": "hubspot-enrich-session",
        "galaxy-client-type": "NodeJs",
        "galaxy-search-type": "DevAPIAddressId",
        "Content-Type": "application/json",
        Accept: "application/json",
      }
    );

    const response = res.data || res; // <-- make sure we are looking at data

    if (!response?.persons?.length) {
      //   console.log("🏠 Full response:", JSON.stringify(response, null, 2));
      console.log("⚠️ No persons found at that address.");
      return [];
    }

    console.log(`✅ Found ${response.persons.length} people at that address.`);
    // console.log("🏠 Persons:", JSON.stringify(response.persons, null, 2));

    return response.persons;
  } catch (error) {
    console.error(
      "❌ Error calling Enformion API:",
      error.response?.data || error.message
    );
    return [];
  }
}
