 This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.                                                                                                   
                                                                                                                                                                                                           
  ---                                                                                                                                                                                                      
  Key Commands                                                                                                                                                                                             
                                                                                                                                                                                                           
  - Development:                                                                                                                                                                                           
  npm run dev                                                                                                                                                                                              
  - Build:                                                                                                                                                                                                 
  npm run build                                                                                                                                                                                            
  - Lint:                                                                                                                                                                                                  
  npm run lint                                                                                                                                                                                             
  - Preview:                                                                                                                                                                                               
  npm run preview                                                                                                                                                                                          
                                                                                                                                                                                                           
  ---                                                                                                                                                                                                      
  Project Structure                                                                                                                                                                                        
                                                                                                                                                                                                           
  The codebase follows a typical React + Vite structure:
  1. Entry Point: src/main.jsx (entry point for the app).                                                                                                                                                  
  2. Pages:                                                                                                                                                                                                
    - /pages/ChatBox.jsx, /pages/CreatePost.jsx, /pages/Login.jsx                                                                                                                                          
    - /pages/Feed.jsx, /pages/Messages.jsx (core features).                                                                                                                                                
                                                                                                                                                                                                           
  3. Components:                                                                                                                                                                                           
    - /components/Sidebar.jsx, /components/UserCard.jsx (UI building blocks).                                                                                                                              
    - /components/StoryModal.jsx, /components/RecentMessage.jsx (dynamic elements).                                                                                                                        
                                                                                                                                                                                                           
  4. Assets:                                                                                                                                                                                               
    - /assets/ (media files like images and logos).                                                                                                                                                        
                                                                                                                                                                                                           
  ---                                                                                                                                                                                                      
  Code Architecture
                                                                                                                                                                                                           
  - Runtime: Uses React 19.1.1 with Vite for fast HMR and bundling.
  - Styling: Tailwind CSS via @vitejs/plugin-react.                                                                                                                                                        
  - Routing: Likely React Router (react-router-dom@7.9.5).                                                                                                                                                 
  - State Management: No centralized state (e.g., Redux/Zustand) detected.                                                                                                                                 
                                                                                                                                                                                                           
  ---                                                                                                                                                                                                      
  Code Quality Rules                                                                                                                                                                                       
                                                                                                                                                                                                           
  ESLint Configuration
                                                                                                                                                                                                           
  - Rules:                                                                                                                                                                                                 
    - Uses eslint@9.36.0 with:                                                                                                                                                                             
        - eslint-plugin-react-hooks@5.2.0                                                                                                                                                                  
      - eslint-plugin-react-refresh@0.4.22                                                                                                                                                                 
      - Custom no-unused-vars rule to ignore uppercase variables (e.g., environment variables).                                                                                                            
                                                                                                                                                                                                           
  - Source Code: src/ directory.                                                                                                                                                                           
                                                                                                                                                                                                           
  ---                                                                                                                                                                                                      
  Development Tips
                                                                                                                                                                                                           
  - Use Fast Refresh (enabled via @vitejs/plugin-react).
  - Lint fixes are recommended before committing.                                                                                                                                                          
  - Tailwind CSS configuration is in /vite.config.js.                                                                                                                                                      
                                                                                                                                                                                                           
  ---                                                                                                                                                                                                      
  Notifications                                                                                                                                                                                            
                                                                                                                                                                                                           
  This CLAUDE.md was generated from:
  - README.md (React + Vite template).                                                                                                                                                                     
  - package.json (dependencies and scripts).                                                                                                                                                               
  - eslint.config.js (rules and plugins).                                                                                                                                                                  
  - File structure analysis (Glob tool).                                                                                                                                                                   
                                                                                                                                                                                                           
  No changes are required unless the user updates dependencies or rules.                   