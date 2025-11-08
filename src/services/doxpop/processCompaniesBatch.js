import { queue } from "../../utils/queue.js";
import processCompanyDoxpop from "./processCompanyDoxpop.js";

export default async function processCompaniesBatch(companies) {
  for (const company of companies) {
    queue.add(() => processCompanyDoxpop(company));
  }

  await queue.onIdle();
  console.log("✅ All companies processed");
}
