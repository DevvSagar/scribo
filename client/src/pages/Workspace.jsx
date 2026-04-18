import { motion as Motion } from "framer-motion";
import {
  CalendarDays,
  Copy,
  Download,
  History,
  Mail,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UploadPanel from "../components/UploadPanel";

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
    caption: "Process a new recording",
    icon: UploadCloud,
  },
  {
    id: "history",
    label: "History",
    caption: "Review saved outputs",
    icon: History,
  },
  {
    id: "scheduler",
    label: "Scheduler",
    caption: "Manage upcoming meetings",
    icon: CalendarDays,
    to: "/dashboard/schedule",
  },
  {
    id: "contact",
    label: "Contact",
    caption: "Get product help",
    icon: Mail,
    to: "/contact",
  },
];

const Workspace = () => {
  const navigate = useNavigate();
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
    <section className="relative min-h-[calc(100svh-81px)] overflow-hidden px-5 py-8 sm:px-8 lg:px-10 xl:px-12 2xl:px-16">
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,#f6f4ef_0%,#fbfbf8_32%,#ffffff_68%,#f2f4ee_100%)]" />
      <div className="absolute left-[-8rem] top-[-4rem] -z-10 h-[24rem] w-[24rem] rounded-full bg-[#dfeadf]/75 blur-3xl" />
      <div className="absolute right-[-8rem] top-24 -z-10 h-[24rem] w-[24rem] rounded-full bg-[#ece0cb]/65 blur-3xl" />
      <div className="absolute bottom-[-10rem] left-1/2 -z-10 h-[22rem] w-[40rem] -translate-x-1/2 rounded-full bg-[#dde3f5]/55 blur-3xl" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(24,24,24,0.028)_1px,transparent_1px),linear-gradient(90deg,rgba(24,24,24,0.028)_1px,transparent_1px)] bg-[size:74px_74px] opacity-40" />

      <div className="mx-auto max-w-[1440px]">
        <Motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="rounded-[2.4rem] border border-black/8 bg-white/82 p-5 shadow-[0_24px_64px_rgba(0,0,0,0.06)] backdrop-blur-2xl sm:p-6 lg:p-7"
        >
          <div className="grid gap-5 xl:grid-cols-[290px_minmax(0,1fr)] xl:items-center">
            <aside className="flex h-full items-center">
              <div className="w-full rounded-[2rem] border border-black/8 bg-white/86 p-4 shadow-[0_18px_46px_rgba(0,0,0,0.05)] backdrop-blur-xl">
                {workspaceNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleWorkspaceNav(item)}
                      className={`mb-2 flex w-full items-start gap-3 rounded-[1.4rem] px-4 py-4 text-left transition last:mb-0 ${
                        isActive
                          ? "bg-[#1f1f1f] text-white shadow-[0_16px_32px_rgba(0,0,0,0.14)]"
                          : "text-[#5f5f5f] hover:bg-[#f7f7f4] hover:text-[#1f1f1f]"
                      }`}
                    >
                      <div
                        className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                          isActive ? "bg-white/10" : "bg-[#f3f3ee]"
                        }`}
                      >
                        <Icon className="h-4.5 w-4.5" strokeWidth={1.9} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-base font-semibold">{item.label}</p>
                        <p className={`mt-1 text-sm leading-6 ${isActive ? "text-white/72" : "text-[#777777]"}`}>
                          {item.caption}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>

            <div className="min-w-0">
              {activeTab === "upload" ? (
                <Motion.div
                  key="workspace-upload"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="rounded-[2rem] border border-black/8 bg-white/86 p-5 shadow-[0_18px_46px_rgba(0,0,0,0.05)] backdrop-blur-xl sm:p-6"
                >
                  <UploadPanel />
                </Motion.div>
              ) : (
                <Motion.div
                  key="workspace-history"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="rounded-[2rem] border border-black/8 bg-white/86 p-5 shadow-[0_18px_46px_rgba(0,0,0,0.05)] backdrop-blur-xl sm:p-6"
                >
                  <div className="flex flex-col gap-4 border-b border-black/8 pb-5 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-3xl">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7a7a7a]">Saved History</p>
                      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#1f1f1f]">
                        Reopen previous outputs without digging around.
                      </h2>
                      <p className="mt-3 text-sm leading-7 text-[#5f5f5f] sm:text-base">
                        Signed-in uploads are saved here with their summaries and action items. Chat responses stay here too,
                        so you can review, copy, download, or delete old entries cleanly.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={loadChats}
                        className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-[#1f1f1f] transition hover:bg-[#fafaf7]"
                      >
                        <History className="h-4 w-4" />
                        Refresh History
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("upload")}
                        className="inline-flex items-center gap-2 rounded-full bg-[#1f1f1f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-black"
                      >
                        <UploadCloud className="h-4 w-4" />
                        New Upload
                      </button>
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="mt-5 rounded-[1.3rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                      {errorMessage}
                    </div>
                  )}

                  <div className="mt-5 grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
                    {isLoadingChats ? (
                      <div className="rounded-[1.8rem] border border-black/8 bg-[#fafaf7] px-5 py-5 text-sm text-[#666666]">
                        Loading chat history...
                      </div>
                    ) : chatHistory.length === 0 ? (
                      <div className="rounded-[1.8rem] border border-black/8 bg-[#fafaf7] px-5 py-5 text-sm text-[#666666]">
                        No saved history yet.
                      </div>
                    ) : (
                      <>
                        <div className="space-y-3">
                          {chatHistory.map((chat) => (
                            <button
                              key={chat._id}
                              type="button"
                              onClick={() => setSelectedHistoryId(chat._id)}
                              className={`block w-full rounded-[1.5rem] border px-4 py-4 text-left transition ${
                                selectedHistoryId === chat._id
                                  ? "border-[#1f1f1f] bg-[#f4f4ef] shadow-[0_14px_28px_rgba(0,0,0,0.05)]"
                                  : "border-black/8 bg-[#fafaf7] hover:bg-white"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7a7a7a]">
                                    {formatChatDate(chat.createdAt)}
                                  </p>
                                  <p className="mt-2 text-sm font-semibold text-[#1f1f1f]">
                                    {chat.type === "upload"
                                      ? chat.fileName || "Uploaded file"
                                      : "Chat with Scribo"}
                                  </p>
                                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#666666]">
                                    {getHistoryPreview(chat)}
                                  </p>
                                </div>
                                <span className="shrink-0 rounded-full border border-black/8 bg-white px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[#666666]">
                                  {chat.type}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>

                        {selectedHistory ? (
                          <div className="rounded-[1.8rem] border border-black/8 bg-[#fafaf7] p-5">
                            <div className="flex flex-col gap-4 border-b border-black/8 pb-5 lg:flex-row lg:items-start lg:justify-between">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7a7a7a]">
                                  {formatChatDate(selectedHistory.createdAt)}
                                </p>
                                <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[#1f1f1f] break-words">
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
                                    className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-[#1f1f1f] transition hover:bg-[#f1f1eb]"
                                  >
                                    <Copy className="h-4 w-4" />
                                    {copiedHistoryId === selectedHistoryId ? "Copied" : "Copy Text"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleDownloadHistory}
                                    className="inline-flex items-center gap-2 rounded-full bg-[#1f1f1f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-black"
                                  >
                                    <Download className="h-4 w-4" />
                                    Download Text
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleDeleteHistory}
                                    disabled={isDeletingHistory}
                                    className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    {isDeletingHistory ? "Deleting..." : "Delete"}
                                  </button>
                                </div>
                              )}
                            </div>

                            <div className="mt-5 space-y-4">
                              {selectedHistory.type === "upload" ? (
                                <>
                                  <div className="rounded-[1.35rem] border border-black/8 bg-white px-4 py-4">
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7a7a7a]">
                                      Upload
                                    </p>
                                    <p className="mt-2 text-sm leading-7 text-[#1f1f1f]">
                                      {selectedHistory.fileName || "Uploaded media file"}
                                    </p>
                                  </div>

                                  <div className="rounded-[1.35rem] border border-black/8 bg-white px-4 py-4">
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7a7a7a]">
                                      Summary
                                    </p>
                                    <p className="mt-2 whitespace-pre-line text-sm leading-7 text-[#1f1f1f]">
                                      {selectedHistory.summary ||
                                        selectedHistory.response ||
                                        "No summary available."}
                                    </p>
                                  </div>

                                  <div className="rounded-[1.35rem] border border-emerald-200 bg-emerald-50/75 px-4 py-4">
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
                                  <div className="rounded-[1.35rem] border border-black/8 bg-white px-4 py-4">
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7a7a7a]">
                                      You
                                    </p>
                                    <p className="mt-2 text-sm leading-7 text-[#1f1f1f]">
                                      {selectedHistory.message}
                                    </p>
                                  </div>

                                  <div className="rounded-[1.35rem] border border-black/8 bg-white px-4 py-4">
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
                          <div className="rounded-[1.8rem] border border-black/8 bg-[#fafaf7] px-5 py-5 text-sm text-[#666666]">
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
        </Motion.div>
      </div>
    </section>
  );
};

export default Workspace;
