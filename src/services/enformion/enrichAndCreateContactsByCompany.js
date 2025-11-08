import createContactsForCompany from "./createContactsForCompany.js";
import getContactsByAddress from "./getContactsByAddress.js";

/**
 * Create & associate contacts using an existing company object
 * @param {Object} company - { id, properties }
 */
export default async function enrichAndCreateContactsByCompany(company) {
  if (!company || !company.id || !company.properties) {
    console.warn("⚠️ Invalid company object provided");
    return;
  }

  const { id: companyId, properties } = company;
  const { owner_first_name, owner_last_name, address, city, state } =
    properties;
  console.log(
    `🔍 Company is : ${owner_first_name}+" "+${address}," "+${city}," "+${state}`
  );

  const addressLine1 = (address || "").trim();
  const addressLine2 = [city, state].filter(Boolean).join(", ").trim();
  console.log("🏠 Searching Enformion by Address:", addressLine1, addressLine2);

  // Fetch persons at this address
  const persons = await getContactsByAddress(addressLine1, addressLine2);

  if (persons.length > 0) {
    await createContactsForCompany(companyId, persons, {
      first: owner_first_name,
      last: owner_last_name,
    });
  } else {
    console.log(`⚠️ No persons found to associate with company ${companyId}`);
  }
}
