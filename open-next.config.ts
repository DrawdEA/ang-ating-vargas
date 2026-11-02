import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Every page reads live data, so no incremental cache is needed.
export default defineCloudflareConfig({});
