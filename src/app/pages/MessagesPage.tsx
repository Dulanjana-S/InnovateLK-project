import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { motion } from "motion/react";
import { Loader2, MessageSquare, Search, Send, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Badge } from "../components/ui/badge";
import { useAuth } from "../contexts/AuthContext";
import { chatService, Conversation, Message, userService, User } from "../services";
import { toast } from "sonner";

export function MessagesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [contacts, setContacts] = useState<User[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [contactSearch, setContactSearch] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const requestedUserId = searchParams.get("userId");
  const selectedConversationIdRef = useRef<string | null>(null);
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  const visibleContacts = useMemo(() => {
    const q = contactSearch.toLowerCase();
    return contacts.filter((contact) => contact.name.toLowerCase().includes(q) || contact.email.toLowerCase().includes(q));
  }, [contacts, contactSearch]);

  const getParticipantId = (participant: any) => participant?._id || participant?.id || participant;

  const getOtherParticipant = (conversation: Conversation) => {
    if (conversation.displayParticipant) {
      return conversation.displayParticipant;
    }

    return conversation.participants.find((participant) => getParticipantId(participant) !== user?.id) || conversation.participants[0] || null;
  };

  const getConversationTitle = (conversation: Conversation) => {
    return conversation.title || getOtherParticipant(conversation)?.name || "Conversation";
  };

  const refreshConversations = async (preferredConversationId?: string) => {
    try {
      setLoadingConversations(true);
      const data = await chatService.getConversations();
      setConversations(data);

      if (data.length === 0) {
        setSelectedConversation(null);
        return [] as Conversation[];
      }

      setSelectedConversation((current) => {
        const targetId = preferredConversationId || current?._id;
        if (!targetId) {
          return data[0];
        }
        return data.find((item) => item._id === targetId) || data[0];
      });

      return data;
    } catch (error: any) {
      toast.error(error.message || "Failed to load conversations");
      return [] as Conversation[];
    } finally {
      setLoadingConversations(false);
    }
  };

  const loadContacts = async () => {
    try {
      const users = await userService.getUsers();
      setContacts(users.filter((contact) => contact._id !== user?.id));
    } catch (error: any) {
      toast.error(error.message || "Failed to load users");
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      setLoadingMessages(true);
      const data = await chatService.getMessages(conversationId, 100);
      setMessages([...data].reverse());
      await chatService.markConversationAsRead(conversationId);
      await refreshConversations(conversationId);
    } catch (error: any) {
      toast.error(error.message || "Failed to load messages");
    } finally {
      setLoadingMessages(false);
    }
  };

  const openDirectConversation = async (participantId: string) => {
    try {
      const conversation = await chatService.getOrCreateDirectConversation(participantId);
      setSelectedConversation(conversation);
      setMessages([]);
      const nextSearchParams = new URLSearchParams(searchParams);
      nextSearchParams.set("userId", participantId);
      setSearchParams(nextSearchParams);
      await refreshConversations(conversation._id);
      return conversation;
    } catch (error: any) {
      toast.error(error.message || "Failed to open conversation");
      return null;
    }
  };

  useEffect(() => {
    selectedConversationIdRef.current = selectedConversation?._id || null;
  }, [selectedConversation?._id]);

  useEffect(() => {
    if (!user) return;
    chatService.initializeSocket();
    void refreshConversations();
    void loadContacts();

    const unsubscribeMessages = chatService.onNewMessage((incomingMessage) => {
      const activeConversationId = selectedConversationIdRef.current;
      const messageConversationId = typeof incomingMessage.conversation === "string"
        ? incomingMessage.conversation
        : (incomingMessage.conversation as any)?._id;

      if (activeConversationId && activeConversationId === messageConversationId) {
        setMessages((prev) => prev.some((message) => message._id === incomingMessage._id) ? prev : [...prev, incomingMessage]);
      }
      void refreshConversations(activeConversationId || undefined);
    });

    return () => {
      unsubscribeMessages();
      chatService.disconnectSocket();
    };
  }, [user?.id]);

  useEffect(() => {
    if (selectedConversation?._id) {
      chatService.joinConversation(selectedConversation._id);
      void loadMessages(selectedConversation._id);
    }
  }, [selectedConversation?._id]);


  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedConversation?._id]);

  useEffect(() => {
    if (!requestedUserId || !user || loadingConversations) {
      return;
    }

    const existing = conversations.find((conversation) => getParticipantId(getOtherParticipant(conversation)) === requestedUserId);
    if (existing) {
      setSelectedConversation(existing);
      return;
    }

    if (requestedUserId !== user.id) {
      void openDirectConversation(requestedUserId);
    }
  }, [requestedUserId, user?.id, loadingConversations, conversations]);

  const handleSend = async () => {
    if (!draft.trim() || !selectedConversation || !user) return;

    try {
      const content = draft.trim();
      let created: Message;
      try {
        created = await chatService.sendMessageSocket(selectedConversation._id, content);
      } catch (_socketError) {
        created = await chatService.sendMessage(selectedConversation._id, content);
      }
      setMessages((prev) => prev.some((message) => message._id === created._id) ? prev : [...prev, created]);
      setDraft("");
      await refreshConversations(selectedConversation._id);
    } catch (error: any) {
      toast.error(error.message || "Failed to send message");
    }
  };

  const selectedParticipant = selectedConversation ? getOtherParticipant(selectedConversation) : null;

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Sign in to view messages</h1>
        <p className="mt-2 text-gray-600">You need an account to open direct conversations.</p>
        <Button asChild className="mt-4">
          <Link to="/login">Go to login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-8">
      <div className="container mx-auto px-4">
        <motion.div className="mb-6" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Messages</h1>
              <p className="text-gray-600">Direct, role-based conversations between innovators, investors, and manufacturers</p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/people">Browse profiles</Link>
            </Button>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  Direct conversations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loadingConversations ? (
                  <div className="py-10 text-center text-gray-500">
                    <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin" />
                    Loading conversations...
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="py-10 text-center text-gray-500">No conversations yet.</div>
                ) : (
                  conversations.map((conversation) => {
                    const other = getOtherParticipant(conversation);
                    return (
                      <button
                        key={conversation._id}
                        onClick={() => {
                          setSelectedConversation(conversation);
                          if (other?._id) {
                            navigate(`/messages?userId=${other._id}`);
                          }
                        }}
                        className={`w-full rounded-xl border p-3 text-left transition ${selectedConversation?._id === conversation._id ? "border-blue-300 bg-blue-50" : "bg-white hover:bg-gray-50"}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-medium">{getConversationTitle(conversation)}</p>
                            <p className="text-xs text-gray-500">{other?.role || "Member"}</p>
                          </div>
                          {conversation.unreadCount ? <Badge>{conversation.unreadCount}</Badge> : null}
                        </div>
                        {conversation.lastMessage?.content ? (
                          <p className="mt-2 line-clamp-2 text-sm text-gray-600">{conversation.lastMessage.content}</p>
                        ) : (
                          <p className="mt-2 text-sm text-gray-400">No messages yet</p>
                        )}
                      </button>
                    );
                  })
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Find people
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input value={contactSearch} onChange={(e) => setContactSearch(e.target.value)} placeholder="Search users..." className="pl-10" />
                </div>
                <ScrollArea className="h-64 pr-3">
                  <div className="space-y-2">
                    {visibleContacts.map((contact) => (
                      <div key={contact._id} className="rounded-lg border p-3">
                        <button onClick={() => void openDirectConversation(contact._id)} className="w-full text-left hover:bg-gray-50">
                          <p className="font-medium">{contact.name}</p>
                          <p className="text-xs text-gray-500">{contact.role} • {contact.email}</p>
                        </button>
                        <div className="mt-3 flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1" asChild>
                            <Link to={`/people/${contact._id}`}>View profile</Link>
                          </Button>
                          <Button size="sm" className="flex-1" onClick={() => void openDirectConversation(contact._id)}>
                            Message
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <Card className="min-h-[650px] flex flex-col">
            <CardHeader className="border-b">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>
                  {selectedConversation ? getConversationTitle(selectedConversation) : "Select a conversation"}
                </CardTitle>
                {selectedParticipant?._id ? (
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/people/${selectedParticipant._id}`}>View profile</Link>
                  </Button>
                ) : null}
              </div>
              {selectedParticipant ? (
                <p className="text-sm text-gray-500">{selectedParticipant.role}{selectedParticipant.company ? ` • ${selectedParticipant.company}` : ""}</p>
              ) : null}
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              {!selectedConversation ? (
                <div className="flex-1 flex items-center justify-center text-center p-8 text-gray-500">
                  <div>
                    <MessageSquare className="mx-auto mb-4 h-10 w-10 text-gray-300" />
                    <p>Select a profile to start a direct conversation.</p>
                    <p className="mt-2 text-sm">
                      Open the <Link to="/people" className="text-blue-600 hover:underline">people directory</Link> to connect with innovators, investors, and manufacturers.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <ScrollArea className="flex-1 p-4">
                    {loadingMessages ? (
                      <div className="py-16 text-center text-gray-500">
                        <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin" />
                        Loading messages...
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="py-16 text-center text-gray-500">No messages yet. Start the conversation.</div>
                    ) : (
                      <div className="space-y-3">
                        {messages.map((message) => {
                          const ownMessage = message.sender?._id === user?.id;
                          return (
                            <div key={message._id} className={`flex ${ownMessage ? "justify-end" : "justify-start"}`}>
                              <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${ownMessage ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"}`}>
                                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                                <p className={`mt-1 text-xs ${ownMessage ? "text-blue-100" : "text-gray-500"}`}>
                                  {new Date(message.createdAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messageEndRef} />
                      </div>
                    )}
                  </ScrollArea>

                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type your message..." onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          void handleSend();
                        }
                      }} />
                      <Button onClick={() => void handleSend()} disabled={!draft.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
