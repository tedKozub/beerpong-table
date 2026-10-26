import { seedV2 } from "./src/db/seed";

seedV2()
  .then(() => {
    console.log("Database seeded successfully!");
    process.exit(0);
  })
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  });
