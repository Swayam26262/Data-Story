/**
 * Script to update a user's tier to enterprise (max credits)
 * Usage: npx tsx scripts/update-user-tier.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import mongoose from 'mongoose';

// Load environment variables FIRST
config({ path: resolve(process.cwd(), '.env.local') });

// Now import after env is loaded
const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

if (!MONGODB_URI) {
    console.error('MONGODB_URI not found in .env.local');
    process.exit(1);
}

// Import User model
import User from '../lib/models/User';

async function updateUserTier() {
    try {
        const email = 'patilswayam96@gmail.com';
        const newTier = 'enterprise';

        console.log(`Connecting to database...`);
        await mongoose.connect(MONGODB_URI!);

        console.log(`Finding user: ${email}`);
        const user = await User.findOne({ email });

        if (!user) {
            console.error(`User not found: ${email}`);
            process.exit(1);
        }

        console.log(`Current tier: ${user.tier}`);
        console.log(`Current limits:`, user.limits);
        console.log(`Stories this month: ${user.storiesThisMonth}`);

        // Update tier
        user.tier = newTier;

        // Reset monthly usage
        user.storiesThisMonth = 0;

        await user.save();

        console.log(`\n✅ User updated successfully!`);
        console.log(`New tier: ${user.tier}`);
        console.log(`New limits:`, user.limits);
        console.log(`Stories per month: ${user.limits.storiesPerMonth === -1 ? 'Unlimited' : user.limits.storiesPerMonth}`);
        console.log(`Max dataset rows: ${user.limits.maxDatasetRows.toLocaleString()}`);
        console.log(`Team members: ${user.limits.teamMembers === -1 ? 'Unlimited' : user.limits.teamMembers}`);

        process.exit(0);
    } catch (error) {
        console.error('Error updating user:', error);
        process.exit(1);
    }
}

updateUserTier();
