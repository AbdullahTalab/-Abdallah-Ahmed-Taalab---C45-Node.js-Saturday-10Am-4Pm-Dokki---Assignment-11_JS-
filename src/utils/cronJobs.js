import cron from "node-cron";
import { userModel } from "../DB/model/user.model.js";


export const deleteUnconfirmedUsersCron = () => {

    cron.schedule("0****", async () => {
        try {
            console.log("===Running CRON Job: Checking for unconfirmed users ===");

            const twentyFourHoursAgo = new Data(Data.now() - 24 * 60 * 60 * 1000);

            const result = await userModel.deleteMany({
                isVerified: false,
                createdAT: { $lte: twentyFourHoursAgo }
            });
            if (result.deletedCount > 0) {
                console.log(`[CRON SUCCESS]Automatically deleted ${result.deletedCount}unconfirmed users`);
            } else {
                console.log("[CRON INFO] No unconfirmed users found to delete.");

            }
        } catch (error) {
            console.error("[CRON ERROR] Error executing unconfirmed users cleanup:", error);

        }
    });
}