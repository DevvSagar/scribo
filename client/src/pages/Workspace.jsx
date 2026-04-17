import { motion as Motion } from "framer-motion";
import { History, Send, UploadCloud } from "lucide-react";
import { useEffect, useState } from "react";
import UploadPanel from "../components/UploadPanel";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const formatChatDate = (value) =>
  new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const getHistoryPreview = (item) => {
  if (item.type === "upload") {
    return item.fileName || "Uploaded file";
  }

  return item.message || "Saved chat";
};

const Workspace = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("upload");
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const loadChats = async () => {
    if (!API_BASE_URL) {
      setErrorMessage("Missing API URL configuration.");
      setIsLoadingChats(false);
      return;
    }

    try {
      setIsLoadingChats(true);
      setErrorMessage("");

      const response = await fetch(`${API_BASE_URL}/chats`, {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not load chats.");
      }

      setChatHistory(data);
    } catch (error) {
      setErrorMessage(error.message || "Could not load chats.");
    } finally {
      setIsLoadingChats(false);
    }
  };

  useEffect(() => {
    loadChats();
  }, []);

  const handleSendMessage = async (event) => {
    event.preventDefault();

    if (!message.trim()) return;
    if (!API_BASE_URL) {
      setErrorMessage("Missing API URL configuration.");
      return;
    }

    try {
      setIsSending(true);
      setErrorMessage("");

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ message }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not save chat.");
      }

      setChatHistory((current) => [data, ...current]);
      setMessage("");
      setActiveTab("history");
    } catch (error) {
      setErrorMessage(error.message || "Could not save chat.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className="min-h-[calc(100svh-81px)] px-5 py-8 sm:px-8 lg:px-10 xl:px-12 2xl:px-16">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 lg:flex-row">
        <aside className="w-full rounded-[2rem] border border-black/8 bg-white p-5 shadow-[0_18px_48px_rgba(0,0,0,0.05)] lg:w-[340px] lg:shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#7a7a7a]">Workspace</p>
              <h1 className="mt-2 text-2xl font-semibold text-[#1f1f1f]">Welcome back</h1>
              <p className="mt-1 text-sm text-[#5f5f5f]">{user?.email}</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 rounded-[1.4rem] border border-black/8 bg-[#fafafa] p-1.5">
            <button
              type="button"
              onClick={() => setActiveTab("upload")}
              className={`inline-flex items-center justify-center gap-2 rounded-[1rem] px-4 py-3 text-sm font-semibold transition ${
                activeTab === "upload" ? "bg-[#1f1f1f] text-white" : "text-[#666666]"
              }`}
            >
              <UploadCloud className="h-4 w-4" />
              Upload
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className={`inline-flex items-center justify-center gap-2 rounded-[1rem] px-4 py-3 text-sm font-semibold transition ${
                activeTab === "history" ? "bg-[#1f1f1f] text-white" : "text-[#666666]"
              }`}
            >
              <History className="h-4 w-4" />
              History
            </button>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[#1f1f1f]">Chat history</p>
              <button
                type="button"
                onClick={() => setActiveTab("upload")}
                className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-semibold text-[#1f1f1f] transition hover:bg-[#fafafa]"
              >
                Go to upload
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {isLoadingChats ? (
                <div className="rounded-[1.3rem] border border-black/8 bg-[#fafafa] px-4 py-4 text-sm text-[#666666]">
                  Loading chats...
                </div>
              ) : chatHistory.length === 0 ? (
                <div className="rounded-[1.3rem] border border-black/8 bg-[#fafafa] px-4 py-4 text-sm text-[#666666]">
                  No history yet. Your uploads and chats will be saved here automatically.
                </div>
              ) : (
                chatHistory.map((chat) => (
                  <div
                    key={chat._id}
                    className={`block w-full rounded-[1.3rem] border px-4 py-3 text-left transition ${
                      activeTab === "history"
                        ? "border-[#1f1f1f] bg-[#f5f5f5]"
                        : "border-black/8 bg-[#fafafa]"
                    }`}
                  >
                    <p className="text-sm font-semibold text-[#1f1f1f]">
                      {formatChatDate(chat.createdAt)}
                    </p>
                    <p className="mt-1 line-clamp-1 text-xs text-[#666666]">
                      {getHistoryPreview(chat)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {activeTab === "upload" ? (
            <Motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
              <div className="mb-4 rounded-[1.8rem] border border-black/8 bg-white px-5 py-4 shadow-[0_16px_40px_rgba(0,0,0,0.04)]">
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#7a7a7a]">Upload</p>
                <h2 className="mt-2 text-2xl font-semibold text-[#1f1f1f]">Upload your meeting file</h2>
                <p className="mt-2 text-sm leading-6 text-[#5f5f5f]">
                  This is your signed-in upload area. After login, you can switch between upload and saved history anytime.
                </p>
              </div>
              <UploadPanel />
            </Motion.div>
          ) : (
            <Motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[2rem] border border-black/8 bg-white p-5 shadow-[0_18px_48px_rgba(0,0,0,0.05)] sm:p-6"
            >
              <div className="flex flex-col gap-3 border-b border-black/8 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#7a7a7a]">History</p>
                  <h2 className="mt-2 text-2xl font-semibold text-[#1f1f1f]">Saved history</h2>
                  <p className="mt-2 text-sm leading-6 text-[#5f5f5f]">
                    Every signed-in upload is saved here by default with its summary, and your chat conversations stay here too.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab("upload")}
                  className="inline-flex items-center justify-center rounded-full border border-black/10 px-4 py-2.5 text-sm font-semibold text-[#1f1f1f] transition hover:bg-[#fafafa]"
                >
                  Open upload page
                </button>
              </div>

              <form onSubmit={handleSendMessage} className="mt-5 rounded-[1.6rem] border border-black/8 bg-[#fafafa] p-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#1f1f1f]">Message</span>
                  <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Type your message here..."
                    rows={4}
                    className="w-full resize-none rounded-[1.2rem] border border-black/10 bg-white px-4 py-3 text-sm text-[#1f1f1f] outline-none"
                  />
                </label>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={isSending}
                    className="inline-flex items-center gap-2 rounded-full bg-[#1f1f1f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <Send className="h-4 w-4" />
                    {isSending ? "Sending..." : "Send"}
                  </button>
                  <button
                    type="button"
                    onClick={loadChats}
                    className="inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-[#1f1f1f] transition hover:bg-white"
                  >
                    <History className="h-4 w-4" />
                    Refresh history
                  </button>
                </div>
              </form>

              {errorMessage && (
                <div className="mt-4 rounded-[1.2rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {errorMessage}
                </div>
              )}

              <div className="mt-5 space-y-4">
                {isLoadingChats ? (
                  <div className="rounded-[1.8rem] border border-black/8 bg-[#fafafa] px-5 py-5 text-sm text-[#666666]">
                    Loading chat history...
                  </div>
                ) : chatHistory.length === 0 ? (
                  <div className="rounded-[1.8rem] border border-black/8 bg-[#fafafa] px-5 py-5 text-sm text-[#666666]">
                    No saved history yet.
                  </div>
                ) : (
                  chatHistory.map((chat) => (
                    <div
                      key={chat._id}
                      className="rounded-[1.8rem] border border-black/8 bg-[#fafafa] p-5"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a7a7a]">
                        {formatChatDate(chat.createdAt)}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-[#1f1f1f]">
                        {chat.type === "upload" ? chat.fileName || "Uploaded file" : "Chat with Scribo"}
                      </p>

                      <div className="mt-4 space-y-3">
                        {chat.type === "upload" ? (
                          <>
                            <div className="rounded-[1.4rem] border border-black/8 bg-white px-4 py-4">
                              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7a7a7a]">
                                Upload
                              </p>
                              <p className="mt-2 text-sm leading-7 text-[#1f1f1f]">
                                {chat.fileName || "Uploaded media file"}
                              </p>
                            </div>

                            <div className="rounded-[1.4rem] border border-black/8 bg-white px-4 py-4">
                              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7a7a7a]">
                                Summary
                              </p>
                              <p className="mt-2 whitespace-pre-line text-sm leading-7 text-[#1f1f1f]">
                                {chat.summary || chat.response || "No summary available."}
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="rounded-[1.4rem] border border-black/8 bg-white px-4 py-4">
                              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7a7a7a]">
                                You
                              </p>
                              <p className="mt-2 text-sm leading-7 text-[#1f1f1f]">
                                {chat.message}
                              </p>
                            </div>

                            <div className="rounded-[1.4rem] border border-black/8 bg-white px-4 py-4">
                              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7a7a7a]">
                                AI
                              </p>
                              <p className="mt-2 text-sm leading-7 text-[#1f1f1f]">
                                {chat.response}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Workspace;
