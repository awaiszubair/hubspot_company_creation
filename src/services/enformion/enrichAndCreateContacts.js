import getCompanyByCaseNumber from "./getCompanyByCaseNumber.js";
import getContactsByAddress from "./getContactsByAddress.js";
import createContactsForCompany from "./createContactsForCompany.js";

export default async function enrichAndCreateContacts(caseNumber) {
  const company = await getCompanyByCaseNumber(caseNumber);
  if (!company) return;

  const { owner_first_name, owner_last_name, address, city, state } =
    company.properties;
  const fullAddress2 = [city, state].filter(Boolean).join(", ");

  const persons = await getContactsByAddress(address, fullAddress2);

  if (persons.length > 0) {
    await createContactsForCompany(company.id, persons, {
      first: owner_first_name,
      last: owner_last_name,
    });
  } else {
    console.log("⚠️ No persons found to associate with this company.");
  }
}
