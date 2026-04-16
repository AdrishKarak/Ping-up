import { Inngest } from "inngest";
import User from "../models/User.js";
import Connection from "../models/Connection.js";
import sendEmail from "../configs/nodeMailer.js";
import Story from "../models/Story.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "Ping-up-app" });

// Inngest function to create user and save user data to a database
const syncUserCreation = inngest.createFunction(
    {
        id: 'sync-user-from-clerk',
        retries: 2,
        triggers: [{ event: 'clerk/user.created' }]
    },
    async ({ event }) => {
        const { id, first_name, last_name, email_addresses, image_url } = event.data;

        let username = email_addresses[0].email_address.split('@')[0];

        // Loop to guarantee a unique username
        while (await User.findOne({ username })) {
            username = `${username}${Math.floor(Math.random() * 10000)}`;
        }

        await User.create({
            _id: id,
            email: email_addresses[0].email_address,
            full_name: first_name + " " + last_name,
            profile_picture: image_url,
            username
        });
    }
);

// Inngest function to update user data in a database
const syncUserUpdation = inngest.createFunction(
    {
        id: 'update-user-from-clerk',
        retries: 2,
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

// Inngest function to delete user data and clean up references
const syncUserDeletion = inngest.createFunction(
    {
        id: 'delete-user-with-clerk',
        retries: 2,
        triggers: [{ event: 'clerk/user.deleted' }]
    },
    async ({ event }) => {
        const deletedId = event.data.id;

        // Remove the user document
        await User.findByIdAndDelete(deletedId);

        // Clean up all connections involving this user
        await Connection.deleteMany({
            $or: [{ from_user_id: deletedId }, { to_user_id: deletedId }]
        });

        // Remove from other users' followers, following, and connections arrays
        await User.updateMany(
            {},
            { $pull: { followers: deletedId, following: deletedId, connections: deletedId } }
        );
    }
);


// Inngest function to send reminder when a new connection request is sent
const sendConnectionRequestReminder = inngest.createFunction(
    {
        id: "send-new-connection-request-reminder",
        retries: 2,
        triggers: [{ event: "app/connection-request" }]
    },
    async ({ event, step }) => {
        const { connectionId } = event.data;

        await step.run('send-connection-request-mail', async () => {
            const connection = await Connection.findById(connectionId).populate('from_user_id to_user_id');

            if (!connection) {
                console.warn(`Connection ${connectionId} not found, skipping email.`);
                return;
            }

            const subject = `New Connection Request from ${connection.from_user_id.full_name}`;
            const body = `<div>
        <p>Hello ${connection.to_user_id.full_name}</p>
        <p>${connection.from_user_id.full_name} has sent you a connection request</p>
        <p>You can view the connection request <a href="${process.env.FRONTEND_URL}/connections">here</a></p>
        </div>`;

            await sendEmail({
                to: connection.to_user_id.email,
                subject,
                body
            });
        });
    }
);

//Inngest Function to delete a story after 24 hours
const deleteStory = inngest.createFunction(
    {
        id: 'delete-story',
        retries: 2,
        triggers: [{ event: 'app/story.delete' }]
    },
    async ({ event, step }) => {
        const { storyId } = event.data;

        await step.sleep('wait-for-24-hours', '24h');
        
        await step.run('delete-story-from-db', async () => {
            await Story.findByIdAndDelete(storyId);
            return { success: true, message: "Story deleted successfully" };
        });
    }
);


export const functions = [
    syncUserCreation,
    syncUserUpdation,
    syncUserDeletion,
    sendConnectionRequestReminder,
    deleteStory
];
