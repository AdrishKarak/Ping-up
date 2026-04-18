import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from "./pages/Login.jsx";
import Messages from "./pages/Messages.jsx";
import Feed from "./pages/Feed.jsx";
import ChatBox from "./pages/ChatBox.jsx";
import Connections from "./pages/Connections.jsx";
import Discover from "./pages/Discover.jsx";
import Profile from "./pages/Profile.jsx";
import CreatePost from "./pages/CreatePost.jsx";
import Layout from "./pages/Layout.jsx"
import { useUser, useAuth } from '@clerk/react';
import Loading from "./components/Loading.jsx";
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchUser } from './features/user/userSlice.js';
import Notification from './components/Notification.jsx';
import api from './api/axios.js';
import { setLatestMessage } from './features/messages/messagesSlice.js';

const App = () => {
    const { user, isLoaded } = useUser();
    const { getToken } = useAuth();
    const dispatch = useDispatch();

    useEffect(() => {
        if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        const fetchData = async () => {
            if (user) {
                const token = await getToken();
                dispatch(fetchUser(token));
            }
        }
        fetchData()
    }, [user, getToken, dispatch]);

    useEffect(() => {
        if (!user?._id) return;

        const baseURL = api.defaults.baseURL || import.meta.env.VITE_BASEURL;
        const eventSource = new EventSource(`${baseURL}/api/message/sse/${user._id}`);

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "connected") return;

            // Handle incoming message globally
            dispatch(setLatestMessage(data));
            
            // Dispatch a custom event for ChatBox to pick up if it's open
            window.dispatchEvent(new CustomEvent('new-message', { detail: data }));
        };

        eventSource.onerror = (error) => {
            console.error("SSE Error:", error);
            eventSource.close();
        };

        return () => eventSource.close();
    }, [user?._id, dispatch]);

    if (!isLoaded) return <Loading />;
    return (
        <div>
            <Toaster />
            <Notification />
            <Routes>
                <Route path="/" element={!user ? <Login /> : <Layout />}>
                    < Route index element={<Feed />} />
                    <Route path='messages' element={<Messages />} />
                    <Route path='messages/:userid' element={<ChatBox />} />
                    <Route path='connections' element={<Connections />} />
                    <Route path='discover' element={<Discover />} />
                    <Route path='profile' element={<Profile />} />
                    <Route path='profile/:profileId' element={<Profile />} />
                    <Route path='create-post' element={<CreatePost />} />

                </Route>
            </Routes>
        </div>
    );
};

export default App;