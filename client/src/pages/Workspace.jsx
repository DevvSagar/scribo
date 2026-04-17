import { motion as Motion } from "framer-motion";
import {
  CalendarDays,
  Copy,
  Trash2,
  Download,
  History,
  Mail,
  UploadCloud,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const getHistoryDetailText = (item) => {
  if (!item) return "";

  if (item.type === "upload") {
    return item.summary || item.response || item.transcript || "";
  }

  return item.response || item.message || "";
};

const workspaceNavItems = [
  {
    id: "upload",
    label: "Upload",
    icon: UploadCloud,
  },
  {
    id: "history",
    label: "History",
    icon: History,
  },
  {
    id: "scheduler",
    label: "Meeting Scheduler",
    icon: CalendarDays,
    to: "/dashboard/schedule",
  },
  {
    id: "contact",
    label: "Contact Us",
    icon: Mail,
    to: "/contact",
  },
];

const Workspace = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("upload");
  const [chatHistory, setChatHistory] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [selectedHistoryId, setSelectedHistoryId] = useState("");
  const [copiedHistoryId, setCopiedHistoryId] = useState("");
  const [isDeletingHistory, setIsDeletingHistory] = useState(false);
  const handleWorkspaceNav = (item) => {
    if (item.to) {
      navigate(item.to);
      return;
    }

    setActiveTab(item.id);
  };

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
      setSelectedHistoryId((current) =>
        current && data.some((item) => item._id === current)
          ? current
          : data[0]?._id || "",
      );
    } catch (error) {
      setErrorMessage(error.message || "Could not load chats.");
    } finally {
      setIsLoadingChats(false);
    }
  };

  useEffect(() => {
    loadChats();
  }, []);

  const selectedHistory = chatHistory.find((item) => item._id === selectedHistoryId) || null;
  const selectedHistoryText = getHistoryDetailText(selectedHistory);

  const handleCopyHistory = async () => {
    if (!selectedHistoryText) {
      return;
    }

    try {
      await navigator.clipboard.writeText(selectedHistoryText);
      setCopiedHistoryId(selectedHistoryId);
      window.setTimeout(() => {
        setCopiedHistoryId("");
      }, 1800);
    } catch {
      setErrorMessage("Could not copy text.");
    }
  };

  const handleDownloadHistory = () => {
    if (!selectedHistoryText || !selectedHistory) {
      return;
    }

    const fileLabel =
      selectedHistory.type === "upload"
        ? selectedHistory.fileName || "summary"
        : "chat-response";
    const blob = new Blob([selectedHistoryText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${fileLabel.replace(/[^a-z0-9._-]/gi, "-")}.txt`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleDeleteHistory = async () => {
    if (!selectedHistory || !API_BASE_URL) {
      return;
    }

    try {
      setIsDeletingHistory(true);
      setErrorMessage("");

      const response = await fetch(
        `${API_BASE_URL}/chats/${encodeURIComponent(selectedHistory._id)}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Could not delete chat.");
      }

      setChatHistory((current) => {
        const remainingItems = current.filter((item) => item._id !== selectedHistory._id);
        setSelectedHistoryId((currentSelectedId) =>
          currentSelectedId === selectedHistory._id
            ? remainingItems[0]?._id || ""
            : currentSelectedId,
        );
        return remainingItems;
      });
    } catch (error) {
      setErrorMessage(error.message || "Could not delete chat.");
    } finally {
      setIsDeletingHistory(false);
    }
  };

  return (
    <section className="min-h-[calc(100svh-81px)] bg-[linear-gradient(180deg,#ffffff_0%,#fbfbfb_55%,#f6f6f6_100%)] px-5 py-8 sm:px-8 lg:px-10 xl:px-12 2xl:px-16">
      <div className="mx-auto w-full max-w-[1380px]">
        <div className="flex justify-center">
          <div className="w-full rounded-[2.2rem] border border-black/8 bg-white p-4 shadow-[0_18px_48px_rgba(0,0,0,0.05)] sm:p-5 lg:p-6">
            <div className="flex flex-col gap-5 lg:flex-row">
              <aside className="w-full lg:w-[300px] lg:shrink-0">
                <div className="rounded-[1.8rem] border border-black/8 bg-[#fafafa] p-4">
                  <p className="text-lg font-semibold text-[#1f1f1f]">
                    {user?.email || "Workspace"}
                  </p>
                  <p className="mt-1 text-sm text-[#666666]">
                    Manage your uploads, saved history, meeting scheduler, and support.
                  </p>
                  <div className="mt-4 rounded-[1.35rem] border border-black/8 bg-white px-4 py-3">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#7a7a7a]">
                      Account
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-[#1f1f1f]">
                        Signed in
                      </p>
                      <span className="inline-flex items-center rounded-full bg-[#1f1f1f] px-3 py-1 text-xs font-semibold tracking-[0.18em] text-white">
                        ACTIVE
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2 rounded-[1.8rem] border border-black/8 bg-white p-3">
                  {workspaceNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleWorkspaceNav(item)}
                        className={`flex items-center gap-3 rounded-[1.2rem] px-4 py-3 text-left text-sm font-semibold transition ${
                          isActive
                            ? "bg-[#1f1f1f] text-white"
                            : "text-[#666666] hover:bg-[#fafafa] hover:text-[#1f1f1f]"
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </aside>

              <div className="min-w-0 flex-1">
                {activeTab === "upload" ? (
                  <Motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
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
                        <h2 className="text-2xl font-semibold text-[#1f1f1f]">Saved history</h2>
                        <p className="mt-2 text-sm leading-6 text-[#5f5f5f]">
                          Every signed-in upload is saved here by default with its summary, and your chat conversations stay here too.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveTab("upload")}
                        className="inline-flex items-center justify-center rounded-full border border-black/10 px-4 py-2.5 text-sm font-semibold text-[#1f1f1f] transition hover:bg-[#fafafa]"
                      >
                        Open upload
                      </button>
                    </div>

                    {errorMessage && (
                      <div className="mt-4 rounded-[1.2rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {errorMessage}
                      </div>
                    )}

                    <div className="mt-5 grid gap-5 xl:grid-cols-[0.78fr_1.22fr]">
                      {isLoadingChats ? (
                        <div className="rounded-[1.8rem] border border-black/8 bg-[#fafafa] px-5 py-5 text-sm text-[#666666]">
                          Loading chat history...
                        </div>
                      ) : chatHistory.length === 0 ? (
                        <div className="rounded-[1.8rem] border border-black/8 bg-[#fafafa] px-5 py-5 text-sm text-[#666666]">
                          No saved history yet.
                        </div>
                      ) : (
                        <>
                          <div className="space-y-3">
                            <button
                              type="button"
                              onClick={loadChats}
                              className="inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-[#1f1f1f] transition hover:bg-white"
                            >
                              <History className="h-4 w-4" />
                              Refresh history
                            </button>

                            {chatHistory.map((chat) => (
                              <button
                                key={chat._id}
                                type="button"
                                onClick={() => setSelectedHistoryId(chat._id)}
                                className={`block w-full rounded-[1.6rem] border px-4 py-4 text-left transition ${
                                  selectedHistoryId === chat._id
                                    ? "border-[#1f1f1f] bg-[#f5f5f5]"
                                    : "border-black/8 bg-[#fafafa] hover:bg-white"
                                }`}
                              >
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a7a7a]">
                                  {formatChatDate(chat.createdAt)}
                                </p>
                                <p className="mt-2 text-sm font-semibold text-[#1f1f1f]">
                                  {chat.type === "upload"
                                    ? chat.fileName || "Uploaded file"
                                    : "Chat with Scribo"}
                                </p>
                                <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#666666]">
                                  {getHistoryPreview(chat)}
                                </p>
                              </button>
                            ))}
                          </div>

                          {selectedHistory ? (
                            <div className="rounded-[1.8rem] border border-black/8 bg-[#fafafa] p-5">
                              <div className="flex flex-col gap-3 border-b border-black/8 pb-5 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a7a7a]">
                                    {formatChatDate(selectedHistory.createdAt)}
                                  </p>
                                  <p className="mt-2 text-2xl font-semibold text-[#1f1f1f]">
                                    {selectedHistory.type === "upload"
                                      ? selectedHistory.fileName || "Uploaded file"
                                      : "Chat with Scribo"}
                                  </p>
                                </div>

                                {selectedHistoryText && (
                                  <div className="flex flex-wrap gap-3">
                                    <button
                                      type="button"
                                      onClick={handleCopyHistory}
                                      className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-[#1f1f1f] transition hover:bg-[#f3f3f3]"
                                    >
                                      <Copy className="h-4 w-4" />
                                      {copiedHistoryId === selectedHistoryId
                                        ? "Copied"
                                        : "Copy text"}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={handleDownloadHistory}
                                      className="inline-flex items-center gap-2 rounded-full bg-[#1f1f1f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-black"
                                    >
                                      <Download className="h-4 w-4" />
                                      Download text
                                    </button>
                                    <button
                                      type="button"
                                      onClick={handleDeleteHistory}
                                      disabled={isDeletingHistory}
                                      className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      {isDeletingHistory ? "Deleting..." : "Delete chat"}
                                    </button>
                                  </div>
                                )}
                              </div>

                              <div className="mt-4 space-y-3">
                                {selectedHistory.type === "upload" ? (
                                  <>
                                    <div className="rounded-[1.4rem] border border-black/8 bg-white px-4 py-4">
                                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7a7a7a]">
                                        Upload
                                      </p>
                                      <p className="mt-2 text-sm leading-7 text-[#1f1f1f]">
                                        {selectedHistory.fileName || "Uploaded media file"}
                                      </p>
                                    </div>

                                    <div className="rounded-[1.4rem] border border-black/8 bg-white px-4 py-4">
                                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7a7a7a]">
                                        Summary
                                      </p>
                                      <p className="mt-2 whitespace-pre-line text-sm leading-7 text-[#1f1f1f]">
                                        {selectedHistory.summary ||
                                          selectedHistory.response ||
                                          "No summary available."}
                                      </p>
                                    </div>

                                    <div className="rounded-[1.4rem] border border-emerald-200 bg-emerald-50/65 px-4 py-4">
                                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                                        Action Items
                                      </p>
                                      {Array.isArray(selectedHistory.actionItems) &&
                                      selectedHistory.actionItems.length > 0 ? (
                                        <ul className="mt-3 space-y-2 text-sm leading-7 text-[#21543d]">
                                          {selectedHistory.actionItems.map((item) => (
                                            <li key={item} className="flex gap-3">
                                              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                                              <span>{item}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      ) : (
                                        <p className="mt-2 text-sm leading-7 text-[#5f5f5f]">
                                          No action items available for this upload.
                                        </p>
                                      )}
                                    </div>

                                  </>
                                ) : (
                                  <>
                                    <div className="rounded-[1.4rem] border border-black/8 bg-white px-4 py-4">
                                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7a7a7a]">
                                        You
                                      </p>
                                      <p className="mt-2 text-sm leading-7 text-[#1f1f1f]">
                                        {selectedHistory.message}
                                      </p>
                                    </div>

                                    <div className="rounded-[1.4rem] border border-black/8 bg-white px-4 py-4">
                                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7a7a7a]">
                                        AI
                                      </p>
                                      <p className="mt-2 text-sm leading-7 text-[#1f1f1f]">
                                        {selectedHistory.response}
                                      </p>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="rounded-[1.8rem] border border-black/8 bg-[#fafafa] px-5 py-5 text-sm text-[#666666]">
                              Select a history item to view its details.
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </Motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Workspace;
