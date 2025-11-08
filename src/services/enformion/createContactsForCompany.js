import { HUBSPOT_API_BASE, HUBSPOT_ACCESS_TOKEN } from "../../config/env.js";
import { axiosPostWithRetry } from "../../utils/axiosRetry.js";

export default async function createContactsForCompany(
  companyId,
  persons,
  ownerName
) {
  for (let person of persons) {
    const name = person.name || {};
    const emails = person.emails?.map((e) => e.email).slice(0, 1) || [];
    const phones = person.phones?.map((p) => p.number).slice(0, 1) || [];
    const firstAddress = person.addresses?.[0];
    const addressStr = firstAddress
      ? `${firstAddress.houseNumber || ""} ${firstAddress.street || ""}, ${
          firstAddress.city || ""
        }, ${firstAddress.state || ""} ${firstAddress.zip || ""}`
      : "";

    const contactType =
      name.firstName?.toLowerCase() === ownerName.first?.toLowerCase() &&
      name.lastName?.toLowerCase() === ownerName.last?.toLowerCase()
        ? "Primary Owner"
        : "Associate";

    try {
      const createContactResponse = await axiosPostWithRetry(
        `${HUBSPOT_API_BASE}/crm/v3/objects/contacts`,
        {
          properties: {
            firstname: name.firstName || "",
            lastname: name.lastName || "",
            email: emails[0] || "",
            phone: phones[0] || "",
            address: addressStr,
            age: person.age || "",
          },
        },
        {
          Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        }
      );

      const contactId = createContactResponse.data?.id;
      console.log(
        `✅ Created ${contactType} Contact: ${name.firstName} ${name.lastName} (ID: ${contactId})`
      );

      await axiosPostWithRetry(
        `${HUBSPOT_API_BASE}/crm/v3/associations/companies/contacts/batch/create`,
        {
          inputs: [
            {
              from: { id: companyId },
              to: { id: contactId },
              type: "company_to_contact",
            },
          ],
        },
        {
          Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        }
      );

      console.log(`🔗 Associated ${contactType} contact with company.`);
    } catch (error) {
      console.error(
        `❌ Failed creating/associating contact ${name.firstName} ${name.lastName}:`,
        error.response?.data || error.message
      );
    }
  }
}
