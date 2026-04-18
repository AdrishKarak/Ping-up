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

    if (!isLoaded) return <Loading />;
    return (
        <div>
            <Toaster />
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