/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Phone, Video, X } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@clerk/react';
import { useSelector } from 'react-redux';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
    CallControls,
    SpeakerLayout,
    StreamCall,
    StreamTheme,
    StreamVideo,
    StreamVideoClient
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';

const CallContext = createContext(null);

const ActiveCall = ({ client, call, onLeave }) => (
    <StreamVideo client={client}>
        <StreamCall call={call}>
            <StreamTheme className="fixed inset-0 z-[100] bg-slate-950 text-white flex flex-col">
                <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10">
                    <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">Ping-up call</p>
                        <p className="text-xs text-slate-400">Encrypted by Stream</p>
                    </div>
                    <button
                        onClick={onLeave}
                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/15 transition-colors"
                        aria-label="Close call"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex-1 min-h-0 relative">
                    <SpeakerLayout />
                </div>

                <div className="px-4 py-4 border-t border-white/10 flex justify-center">
                    <CallControls onLeave={onLeave} />
                </div>
            </StreamTheme>
        </StreamCall>
    </StreamVideo>
);

export const CallProvider = ({ children }) => {
    const currentUser = useSelector((state) => state.user.value);
    const { getToken } = useAuth();
    
    const [callClient, setCallClient] = useState(null);
    const [activeCall, setActiveCall] = useState(null);
    const [callLoading, setCallLoading] = useState(false);
    const [incomingCall, setIncomingCall] = useState(null);

    const leaveCall = useCallback(async () => {
        const callToLeave = activeCall;
        const clientToDisconnect = callClient;

        setActiveCall(null);
        setCallClient(null);
        setCallLoading(false);

        try {
            await callToLeave?.leave();
        } catch (error) {
            console.warn("Failed to leave Stream call", error);
        }

        try {
            await clientToDisconnect?.disconnectUser();
        } catch (error) {
            console.warn("Failed to disconnect Stream client", error);
        }
    }, [activeCall, callClient]);

    const startCall = useCallback(async (callKind, options = {}, targetUserId) => {
        if (callLoading || activeCall || !currentUser?._id || !targetUserId) return;

        setCallLoading(true);
        let streamClient;
        let call;

        try {
            const token = await getToken();
            const { data } = await api.post('/api/message/call-token', { to_user_id: targetUserId }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!data.success) {
                throw new Error(data.message);
            }

            streamClient = new StreamVideoClient({
                apiKey: data.apiKey,
                user: data.user,
                token: data.token
            });
            call = streamClient.call(data.callType, data.callId);

            await call.join({
                create: true,
                ring: options.sendInvite !== false,
                notify: false,
                video: callKind === 'video',
                data: {
                    members: [
                        { user_id: currentUser._id },
                        { user_id: targetUserId }
                    ],
                    created_by_id: currentUser._id
                }
            });

            setCallClient(streamClient);
            setActiveCall(call);
            setIncomingCall(null);

            if (options.sendInvite !== false) {
                api.post('/api/message/call-invite', { to_user_id: targetUserId, call_kind: callKind }, {
                    headers: { Authorization: `Bearer ${token}` }
                }).catch((error) => {
                    console.warn("Failed to send call invite", error);
                });
            }
        } catch (error) {
            call?.leave().catch(() => {});
            streamClient?.disconnectUser().catch(() => {});
            toast.error(error.response?.data?.message || error.message || "Failed to start call");
        } finally {
            setCallLoading(false);
        }
    }, [currentUser?._id, activeCall, callLoading, getToken]);

    const acceptCall = useCallback(() => {
        if (!incomingCall) return;
        const callerId = typeof incomingCall.from_user_id === "object" ? incomingCall.from_user_id._id : incomingCall.from_user_id;
        startCall(incomingCall.call_kind, { sendInvite: false }, callerId);
    }, [incomingCall, startCall]);

    const declineCall = useCallback(() => {
        setIncomingCall(null);
    }, []);

    // Listen for incoming calls via SSE custom event
    useEffect(() => {
        const handleIncomingCall = (event) => {
            const data = event.detail;
            setIncomingCall(data);
        };

        window.addEventListener('incoming-call', handleIncomingCall);
        return () => {
            window.removeEventListener('incoming-call', handleIncomingCall);
        };
    }, []);

    // Handle user logout or session loss
    useEffect(() => {
        if (!currentUser?._id) {
            if (activeCall || callClient) {
                leaveCall();
            }
            setIncomingCall(null);
        }
    }, [currentUser?._id, activeCall, callClient, leaveCall]);

    // Cleanup on component unmount
    useEffect(() => {
        return () => {
            activeCall?.leave().catch((error) => console.warn("Failed to leave Stream call", error));
            callClient?.disconnectUser().catch((error) => console.warn("Failed to disconnect Stream client", error));
        };
    }, [activeCall, callClient]);

    return (
        <CallContext.Provider value={{
            incomingCall,
            activeCall,
            callClient,
            callLoading,
            startCall,
            acceptCall,
            declineCall,
            leaveCall
        }}>
            {children}

            <AnimatePresence>
                {incomingCall && !activeCall && !callLoading && (
                    <Motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="fixed top-24 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-[100] rounded-2xl bg-white border border-slate-200 shadow-xl px-4 py-3 flex items-center gap-3 dark:bg-slate-900 dark:border-slate-800 max-w-sm w-full"
                    >
                        <div className="relative shrink-0">
                            <img
                                src={incomingCall.from_user_id?.profile_picture}
                                alt={incomingCall.from_user_id?.full_name || "Caller"}
                                className="w-10 h-10 rounded-xl object-cover ring-2 ring-white shadow-sm dark:ring-slate-950"
                            />
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center border border-white dark:border-slate-900">
                                {incomingCall.call_kind === 'video' ? <Video className="w-2.5 h-2.5" /> : <Phone className="w-2.5 h-2.5" />}
                            </div>
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-slate-900 truncate dark:text-slate-100">
                                Incoming {incomingCall.call_kind} call
                            </p>
                            <p className="text-xs text-slate-500 truncate dark:text-slate-400">
                                {incomingCall.from_user_id?.full_name || incomingCall.from_user_id?.username}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={declineCall}
                                className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                aria-label="Decline call"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <button
                                onClick={acceptCall}
                                className="w-9 h-9 flex items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                                aria-label="Accept call"
                            >
                                {incomingCall.call_kind === 'video' ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                            </button>
                        </div>
                    </Motion.div>
                )}

                {callLoading && (
                    <Motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-full bg-slate-950/90 text-white text-xs font-semibold shadow-lg"
                    >
                        Connecting call...
                    </Motion.div>
                )}

                {callClient && activeCall && (
                    <ActiveCall client={callClient} call={activeCall} onLeave={leaveCall} />
                )}
            </AnimatePresence>
        </CallContext.Provider>
    );
};

export const useCall = () => {
    const context = useContext(CallContext);
    if (!context) {
        throw new Error('useCall must be used within a CallProvider');
    }
    return context;
};
