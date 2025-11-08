import { fetchCompanies } from "./fetchCompanies.js";
import { processChunk } from "./processChunk.js";
import { batchUpdateCompanies } from "./batchUpdateCompanies.js";
import { chunkArray } from "./helpers/chunkArray.js";

const CHUNK_SIZE = 100;
const IS_TEST_MODE = true;
const TEST_NAME_PREFIX = "Test-";

export async function processRealEstateUpdates() {
  console.log("🏁 RealEstate Process Started");

  const filterGroups = IS_TEST_MODE
    ? [
        {
          filters: [
            {
              propertyName: "name",
              operator: "CONTAINS_TOKEN",
              value: TEST_NAME_PREFIX,
            },
            {
              propertyName: "automation_completed",
              operator: "NOT_HAS_PROPERTY",
            },
          ],
        },
      ]
    : [
        {
          filters: [
            {
              propertyName: "automation_completed",
              operator: "NOT_HAS_PROPERTY",
            },
          ],
        },
      ];

  const companies = await fetchCompanies(filterGroups);
  if (companies.length === 0) {
    console.log("📭 No companies to process.");
    return;
  }

  console.log(`📦 Processing ${companies.length} companies in chunks...`);
  const companyChunks = chunkArray(companies, CHUNK_SIZE);

  for (const chunk of companyChunks) {
    const results = await processChunk(chunk);

    const successfulUpdates = results
      .filter((r) => r.status === "fulfilled" && r.value.success)
      .map((r) => r.value);

    if (successfulUpdates.length > 0) {
      const updateChunks = chunkArray(successfulUpdates, 100);
      for (const updateChunk of updateChunks) {
        await batchUpdateCompanies(updateChunk);
      }
    }

    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log("✅ RealEstate processing completed.");
}
