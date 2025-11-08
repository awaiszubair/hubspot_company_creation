import dotenv from "dotenv";
import { createServer } from "./src/app.js";

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = createServer();

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
