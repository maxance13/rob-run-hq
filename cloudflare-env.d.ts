declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    HQ_ADMIN_EMAIL?: string;
    BUCKET?: R2Bucket;
  }
}
