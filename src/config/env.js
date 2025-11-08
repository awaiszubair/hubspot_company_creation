import dotenv from "dotenv";
dotenv.config();

export const HUBSPOT_API_BASE = "https://api.hubapi.com";
export const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

export const ENFORMION_AP_NAME = process.env.ENFORMION_AP_NAME;
export const ENFORMION_AP_PASSWORD = process.env.ENFORMION_AP_PASSWORD;

export const DOXPOP_API_BASE = "https://demo-api.doxpop.com";
export const DOXPOP_BASIC_AUTH = Buffer.from("demo:demo").toString("base64");
