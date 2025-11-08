import { queue } from "../utils/queue.js";
import { processCompanyQueue } from "../modules/companyProcessor.js";

export async function handleCompanyCreated(req, res) {
  res.status(200).send("OK"); // HubSpot expects immediate response

  const events = Array.isArray(req.body) ? req.body : [req.body];

  for (const event of events) {
    const companyId = event.objectId;
    if (!companyId) {
      console.log("⚠️ Received webhook without objectId");
      continue;
    }

    queue.add(async () => {
      await new Promise((r) => setTimeout(r, 3000)); // optional delay
      await processCompanyQueue(companyId);
    });
  }
}
