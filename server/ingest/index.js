import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "Ping-up-app" });

//inngest function to create user and save user data to a database

// Create an empty array where we'll export future Inngest functions
export const functions = [];