import { Inngest } from "inngest";
import User from "../models/User.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "Ping-up-app" });

// Inngest function to create user and save user data to a database
const syncUserCreation = inngest.createFunction(
    {
        id: 'sync-user-from-clerk',
        triggers: [{ event: 'clerk/user.created' }]
    },
    async ({ event }) => {
        const { id, first_name, last_name, email_addresses, image_url } = event.data;

        let username = email_addresses[0].email_address.split('@')[0];

        const user = await User.findOne({ username });
        if (user) {
            username = `${username}${Math.floor(Math.random() * 10000)}`;
        }

        await User.create({
            _id: id,
            email: email_addresses[0].email_address,
            full_name: first_name + " " + last_name,
            profile_picture: image_url,
            username
        });

        console.log("✅ User created:", id);
    }
);

// Inngest function to update user data in a database
const syncUserUpdation = inngest.createFunction(
    {
        id: 'update-user-from-clerk',
        triggers: [{ event: 'clerk/user.updated' }]
    },
    async ({ event }) => {
        const { id, first_name, last_name, email_addresses, image_url } = event.data;

        await User.findByIdAndUpdate(id, {
            email: email_addresses[0].email_address,
            full_name: first_name + " " + last_name,
            profile_picture: image_url,
        });
    }
);

// Inngest function to delete user data in a database
const syncUserDeletion = inngest.createFunction(
    {
        id: 'delete-user-with-clerk',
        triggers: [{ event: 'clerk/user.deleted' }]
    },
    async ({ event }) => {
        await User.findByIdAndDelete(event.data.id);
    }
);

export const functions = [
    syncUserCreation,
    syncUserUpdation,
    syncUserDeletion
];