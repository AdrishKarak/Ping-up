import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/react';
import Loading from "./components/Loading.jsx";
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser } from './features/user/userSlice.js';
import { fetchConnections } from './features/connections/connectionSlice.js';
import Notification from './components/Notification.jsx';
import api from './api/axios.js';
import { setLatestMessage } from './features/messages/messagesSlice.js';

// Lazy load components
const Login = lazy(() => import("./pages/Login.jsx"));
const Messages = lazy(() => import("./pages/Messages.jsx"));
const Feed = lazy(() => import("./pages/Feed.jsx"));
const ChatBox = lazy(() => import("./pages/ChatBox.jsx"));
const Connections = lazy(() => import("./pages/Connections.jsx"));
const Discover = lazy(() => import("./pages/Discover.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const CreatePost = lazy(() => import("./pages/CreatePost.jsx"));
const Layout = lazy(() => import("./pages/Layout.jsx"));
const PostDetail = lazy(() => import("./pages/PostDetail.jsx"));

const App = () => {
    const { user, isLoaded } = useUser();
    const { getToken } = useAuth();
    const dispatch = useDispatch();
    const currentUser = useSelector((state) => state.user.value);

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
                dispatch(fetchConnections(token));
            }
        }
        fetchData()
    }, [user, getToken, dispatch]);

    useEffect(() => {
        if (!currentUser?._id) return;

        const baseURL = api.defaults.baseURL || import.meta.env.VITE_BASEURL;
        const eventSource = new EventSource(`${baseURL}/api/message/sse/${currentUser._id}`);

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "connected") return;
            if (data.type === "call-invite") {
                window.dispatchEvent(new CustomEvent('incoming-call', { detail: data }));
                return;
            }

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
    }, [currentUser?._id, dispatch]);

    if (!isLoaded) return <Loading />;
    
    return (
        <div>
            <Toaster />
            <Notification />
            <Suspense fallback={<Loading />}>
                <Routes>
                    <Route path="/" element={!user ? <Login /> : <Layout />}>
                        <Route index element={<Feed />} />
                        <Route path='messages' element={<Messages />} />
                        <Route path='messages/:userid' element={<ChatBox />} />
                        <Route path='connections' element={<Connections />} />
                        <Route path='discover' element={<Discover />} />
                        <Route path='profile' element={<Profile />} />
                        <Route path='profile/:profileId' element={<Profile />} />
                        <Route path='create-post' element={<CreatePost />} />
                        <Route path='post/:postId' element={<PostDetail />} />
                    </Route>
                </Routes>
            </Suspense>
        </div>
    );
};

export default App;
