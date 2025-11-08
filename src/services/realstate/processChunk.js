import dotenv from "dotenv";
import { axiosPostWithRetry } from "../../utils/axiosRetry.js";
dotenv.config();

const REALESTATE_API_BASE = "https://api.realestateapi.com/v2/PropertyDetail";

export async function processChunk(companiesChunk) {
  const promises = companiesChunk.map(async (company) => {
    const { id, properties } = company;
    const address = properties.address?.trim();
    const city = properties.city?.trim();
    const state = properties.state?.trim();

    if (!address || !city || !state) {
      console.log("Address: ", address);
      console.log(`⚠️ Skipping company ${id}: Missing address/city/state`);
      return { id, success: false, reason: "Missing address data" };
    }

    const fullAddress = `${address}, ${city}, ${state}`;
    const payload = { address: fullAddress };

    try {
      // 👇 Use retry-safe Axios wrapper (handles DNS/timeouts gracefully)
      const response = await axiosPostWithRetry(
        REALESTATE_API_BASE,
        payload,
        {
          "x-api-key": process.env.REALESTATE_API_KEY,
          "Content-Type": "application/json",
        },
        8, // retries
        2000 // delay base (ms)
      );

      const apiData = response.data?.data;
      if (!apiData) {
        console.log(`⚠️ Failed for company ${id}: No data returned`);
        return { id, success: false, reason: "Empty data" };
      }

      // const updates = {
      //   owner_first_name: apiData.ownerInfo?.owner1FirstName || "Not found",
      //   owner_full_name: apiData.ownerInfo?.owner1FullName || "Not found",
      //   owner_last_name: apiData.ownerInfo?.owner1LastName || "Not found",
      //   case_number:
      //     apiData.auctionInfo?.caseNumber ||
      //     apiData.foreclosureInfo?.[0]?.caseNumber ||
      //     "Not found",
      //   document_type:
      //     apiData.auctionInfo?.documentType ||
      //     apiData.foreclosureInfo?.[0]?.documentType ||
      //     "Not found",
      //   estimated_bank_value:
      //     apiData.auctionInfo?.estimatedBankValue ||
      //     apiData.foreclosureInfo?.[0]?.estimatedBankValue ||
      //     "Not found",
      //   judgmentamount:
      //     apiData.auctionInfo?.judgmentAmount ||
      //     apiData.foreclosureInfo?.[0]?.judgmentAmount ||
      //     "Not found",
      //   judgment_date:
      //     apiData.auctionInfo?.judgmentDate ||
      //     apiData.foreclosureInfo?.[0]?.judgmentDate ||
      //     "Not found",
      //   opening_bid:
      //     apiData.auctionInfo?.openingBid ||
      //     apiData.foreclosureInfo?.[0]?.openingBid ||
      //     "Not found",

      //   // ✅ Boolean fields stay untouched
      //   vacant_property: apiData.vacant ?? null,
      //   mls_active: apiData.mlsActive ?? null,
      //   auction: apiData.auction ?? null,
      //   death_record_found: apiData.death ?? null,
      //   lien_record_found: apiData.lien ?? null,
      //   judgment_record_found: apiData.judgment ?? null,

      //   // ✅ Numeric/estimation fields with fallback
      //   estimated_mortgage_balance:
      //     apiData.estimatedMortgageBalance ?? "Not found",
      //   open_mortgage_balance: apiData.openMortgageBalance ?? "Not found",
      //   estimated_property_value: apiData.estimatedValue ?? "Not found",

      //   automation_completed: true,
      // };

      // const updates = {
      //   owner_first_name: apiData.ownerInfo?.owner1FirstName || "Not found",
      //   owner_full_name: apiData.ownerInfo?.owner1FullName || "Not found",
      //   owner_last_name: apiData.ownerInfo?.owner1LastName || "Not found",
      //   case_number:
      //     apiData.auctionInfo?.caseNumber ||
      //     apiData.foreclosureInfo?.[0]?.caseNumber ||
      //     "Not found",
      //   document_type:
      //     apiData.auctionInfo?.documentType ||
      //     apiData.foreclosureInfo?.[0]?.documentType ||
      //     "Not found",

      //   // ✅ Numeric fields - use 0 for missing data
      //   estimated_bank_value:
      //     apiData.auctionInfo?.estimatedBankValue ||
      //     apiData.foreclosureInfo?.[0]?.estimatedBankValue ||
      //     0,
      //   judgmentamount:
      //     apiData.auctionInfo?.judgmentAmount ||
      //     apiData.foreclosureInfo?.[0]?.judgmentAmount ||
      //     0,
      //   judgment_date:
      //     apiData.auctionInfo?.judgmentDate ||
      //     apiData.foreclosureInfo?.[0]?.judgmentDate ||
      //     0,
      //   opening_bid:
      //     apiData.auctionInfo?.openingBid ||
      //     apiData.foreclosureInfo?.[0]?.openingBid ||
      //     0,

      //   // ✅ Boolean fields - use false for missing data
      //   vacant_property: apiData.vacant ?? false,
      //   mls_active: apiData.mlsActive ?? false,
      //   auction: apiData.auction ?? false,
      //   death_record_found: apiData.death ?? false,
      //   lien_record_found: apiData.lien ?? false,
      //   judgment_record_found: apiData.judgment ?? false,

      //   // ✅ Numeric/estimation fields - use 0 for missing data
      //   estimated_mortgage_balance: apiData.estimatedMortgageBalance ?? 0,
      //   open_mortgage_balance: apiData.openMortgageBalance ?? 0,
      //   estimated_property_value: apiData.estimatedValue ?? 0,

      //   automation_completed: true,
      // };

      const updates = {
        // === Owner Information ===
        owner_first_name: apiData.ownerInfo?.owner1FirstName || "Not found",
        owner_full_name: apiData.ownerInfo?.owner1FullName || "Not found",
        owner_last_name: apiData.ownerInfo?.owner1LastName || "Not found",

        // === Foreclosure/Auction Details ===
        // case_number:
        //   apiData.auctionInfo?.caseNumber ||
        //   apiData.foreclosureInfo?.[0]?.caseNumber ||
        //   "Not found",
        document_type:
          apiData.auctionInfo?.documentType ||
          apiData.foreclosureInfo?.[0]?.documentType ||
          "Not found",
        estimated_bank_value:
          apiData.auctionInfo?.estimatedBankValue ||
          apiData.foreclosureInfo?.[0]?.estimatedBankValue ||
          0,
        judgmentamount:
          apiData.auctionInfo?.judgmentAmount ||
          apiData.foreclosureInfo?.[0]?.judgmentAmount ||
          0,
        judgment_date:
          apiData.auctionInfo?.judgmentDate ||
          apiData.foreclosureInfo?.[0]?.judgmentDate ||
          0,
        opening_bid:
          apiData.auctionInfo?.openingBid ||
          apiData.foreclosureInfo?.[0]?.openingBid ||
          0,

        // Auction timing & contact info
        auction_date:
          apiData.auctionInfo?.auctionDate ||
          apiData.foreclosureInfo?.[0]?.auctionDate ||
          null,
        // auction_time:
        //   parseAuctionDateTime(
        //     apiData.auctionInfo?.auctionDate || apiData.foreclosureInfo?.[0]?.auctionDate,
        //     apiData.auctionInfo?.auctionTime || apiData.foreclosureInfo?.[0]?.auctionTime
        //   ) || null,
        trustee_name:
          apiData.auctionInfo?.trusteeFullName ||
          apiData.foreclosureInfo?.[0]?.trusteeFullName ||
          "Not found",
        trustee_phone:
          apiData.auctionInfo?.trusteePhone ||
          apiData.foreclosureInfo?.[0]?.trusteePhone ||
          "Not found",
        lender_name:
          apiData.auctionInfo?.lenderName ||
          apiData.foreclosureInfo?.[0]?.lenderName ||
          "Not found",

        // === Property Valuation & Financials ===
        estimated_property_value: apiData.estimatedValue ?? 0,
        last_sale_price: apiData.lastSalePrice ?? 0,
        last_sale_date: apiData.lastSaleDate || "Not found",
        estimated_mortgage_balance: apiData.estimatedMortgageBalance ?? 0,
        open_mortgage_balance: apiData.openMortgageBalance ?? 0,

        // === Risk & Status Flags ===
        vacant_property: apiData.vacant ?? false,
        mls_active: apiData.mlsActive ?? false,
        auction: apiData.auction ?? false,

        // Legal/Financial red flags
        death_record_found: apiData.death ?? false,
        lien_record_found: apiData.lien ?? false,
        judgment_record_found: apiData.judgment ?? false,

        // === MLS Information ===
        mls_status: apiData.mlsStatus || "Not found",

        automation_completed: true,
      };

      return { id, success: true, updates };
    } catch (error) {
      console.error(
        `❌ Error processing ${id}:`,
        error.response?.data || error.message
      );
      return { id, success: false, reason: error.message };
    }
  });

  return Promise.allSettled(promises);
}
