# Ping-up Performance Optimization Document

This document records the full suite of backend, frontend, database, and system-level performance optimizations implemented in Ping-up to reduce latency, prevent database bottlenecks, and ensure the system scales efficiently.

---

## 💾 Database & Indexing Optimizations

### 1. Paginated MongoDB Queries (Skip & Limit)
* **Discover Search:** Refactored search queries to support pagination. The database now loads 9 items at a time (`.skip((page - 1) * limit).limit(limit)`) rather than querying the entire user collection, reducing memory overhead on search queries.
* **Message Widget:** Configured the Feed's *Recent Messages* sidebar widget to slice data on the client with a 4-message limit, keeping the rendering payload extremely small.

### 2. High-Performance Schema Indexing
* **Feed Retrieval:** Added an index on `createdAt: -1` to the `Post` schema to avoid in-memory database sorting during feed generation. Sorted queries now execute in $O(\log N)$ time using the index tree.
* **Compound Feed Index:** Placed compound indexes (`user: 1, createdAt: -1`) directly on the `postSchema` prior to model compilation to ensure they are properly registered.
* **User Search Indices:** Added indexing on `full_name` and `location` fields in the `User` schema to optimize `$or` pattern queries during user discovery.

### 3. Server-side Query Projections & Filtering
* **Discover Projections:** Optimized query payloads by selecting only the specific fields required by the UI (`.select('_id profile_picture full_name username bio location followers following connections')`), preventing transmission of cover photos and unused metadata.
* **Query-Level Exclusion:** Modified the discover query to exclude the logged-in user directly at the database query level (`_id: { $ne: userId }`) rather than fetching the user and filtering in memory.

---

## ⚡ Server-Side & Caching Optimizations

### 1. MongoDB Aggregation Pipelines
* **Recent Messages Retrieval:** Replaced the legacy in-memory javascript filtering of conversation messages with a native MongoDB aggregation pipeline:
  ```javascript
  Message.aggregate([
      { $match: { $or: [{ from_user_id: userId }, { to_user_id: userId }] } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: { $cond: [{ $eq: ["$from_user_id", userId] }, "$to_user_id", "$from_user_id"] }, lastMessage: { $first: "$$ROOT" } } },
      { $replaceRoot: { newRoot: "$lastMessage" } },
      { $sort: { createdAt: -1 } }
  ])
  ```
  This reduces message payload processing time on Node.js by performing grouping and sorting directly on the database engine.

### 2. Redis Caching
* **User Profile Data:** Caches public profiles (`profile:${profileId}`) in Redis for 15 minutes (`900` seconds).
* **Current User Data:** Caches session-specific user data (`user:${userId}`) in Redis for 10 minutes (`600` seconds).
* **Automatic Cache Invalidation:** Automatically invalidates cached user profiles when updates occur (e.g. following/unfollowing or modifying profile details) to maintain data consistency.

### 3. Rate Limiting & Compression
* **API Protection:** Redis-backed rate limiting protects all critical authentication and write routes against API abuse and DDoS attacks.
* **Response Compression:** The Express server uses Gzip compression (`compression()`) to reduce network transit sizes for JSON responses.

### 4. Real-Time Video & Audio Calls
* **SSE Event Invites:** Incoming call invitations are routed instantly through Server-Sent Events (SSE) connections instead of heavy HTTP polling, saving server CPU cycles and database load.
* **On-Demand Token Generation:** Video/audio call tokens (via Stream SDK) are generated dynamically on-demand only when a call starts, preventing unnecessary token calculation and token leakage.

### 5. Redis Pub/Sub for Real-Time Messages
* **Multi-Instance Brokerage:** Solves the horizontal scaling problem by utilizing Redis Pub/Sub on the `'MESSAGES'` channel.
* **Real-Time Handoff:** When a message is sent, the server saves it to MongoDB and publishes it to Redis. Every server node subscribes to the channel and routes the incoming broadcast to the recipient's open Server-Sent Events (SSE) connection. This ensures instant delivery even if the sender and receiver are connected to different load-balanced server instances.
      
      ### 5.1. The Real-Time Pipeline Workflow:                                                                                     
                                                                                                                              
  1. DB Persistence: When a user sends a message, it is first saved to MongoDB via  Message.create  in messageController.js.       
  2. Publishing to Redis: If Redis is connected, the server publishes the message payload to a Redis channel called           
  'MESSAGES' :                                                                                                                
    await pubClient.publish('MESSAGES', JSON.stringify({ to_user_id, messageWithUserData }));                                 
                                                                                                                              
  3. Subscribing & SSE Delivery:                                                                                              
      • During server startup, every backend node subscribes to the  'MESSAGES'  Redis channel:                               
        await subClient.subscribe('MESSAGES', (message) => { ... });                                                          
                                                                                                                              
      • When Redis broadcasts a message, the server instance checks if the recipient is connected to its local real-time      
      Server-Sent Events (SSE) connections list ( connectedClients ).                                                         
      • If yes, the server writes the message directly to the client's HTTP response stream.                                  
  4. Single-Instance Fallback: If Redis is disconnected or unavailable, the code contains a fallback that directly routes the 
  message to the recipient if they happen to be connected to the exact same server instance.                                  
  ──────                                                                                                                      
  ### 5.2. Why is this highly optimized?                                                                                        
                                                                                                                              
  • Horizontal Scaling (Cross-Instance Coordination): On hosting platforms (like Render or AWS) where you might spin up       
  multiple server containers (nodes) behind a load balancer:                                                                  
      • Sender might be connected to Server Instance A.                                                                       
      • Receiver might be connected to Server Instance B.                                                                     
      • Without Redis, Server A would look at its local connections, not find the recipient, and the receiver would never get 
      the real-time ping.                                                                                                     
      • With Redis, Instance A publishes the message to Redis, Redis broadcasts it to Instance B (and all other instances),   
      and Instance B instantly pushes it down the receiver's active SSE stream.                                               
  • Low Latency: Redis runs entirely in-memory, making the pub/sub handoff take less than a millisecond.

---

## 🖥️ Client-Side & UI Optimizations

### 1. Search Query Caching & Memoization
* **Memoization Cache:** Implemented a query cache using React `useRef` inside the Discover search page. If a user deletes a character and re-types it, the search instantly loads from the cache, eliminating redundant API requests.

### 2. Late Querying (Search Thresholds)
* **API Threshold:** Configured search boxes to query only when the input length is **3 or more characters**. If the search input is shorter (1 or 2 characters), it defaults to displaying standard suggestions without making API calls.

### 3. UI Pagination & Lazy Loading
* **Infinite Scroll & Load More:**
  * **Feed Page:** Uses TanStack Query `useInfiniteQuery` for cursor-based pagination, allowing endless feed scrolling.
  * **Discover Page:** Loads 9 cards initially and appends 9 more upon clicking "Load More".
  * **Messages, Connections, and Profile Pages:** Implemented client-side pagination (rendering 9 items at first and loading 9 more on click) to prevent DOM-node bloat and render lags.

### 4. Image Delivery & Code Splitting
* **Vite Code Splitting:** Lazy loads major page components (`Suspense` and `lazy()`) to reduce the initial bundle size and JavaScript load times.
* **Lazy Image Loading:** Added `loading="lazy"` to post and profile images so browsers only load images as they enter the viewport.
* **Real-time Image Compression:** Integrated ImageKit.io to compress image uploads into WebP format (`quality: 80`) and resize them dynamically to screen dimensions.

### 5. Scrollbar Optimization
* Created a global `.no-scrollbar` class in `index.css` to hide scrollbars globally on scrollable divs across all browsers while keeping scrolling functionality intact, preventing ugly browser UI defaults.
