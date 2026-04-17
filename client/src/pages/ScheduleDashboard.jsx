import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ConnectGoogleButton from "../components/scheduler/ConnectGoogleButton";
import CreateMeetingForm from "../components/scheduler/CreateMeetingForm";
import MeetingList from "../components/scheduler/MeetingList";
import {
  createScheduledMeeting,
  deleteScheduledMeeting,
  disconnectGoogleCalendar,
  getGoogleCalendarConnectUrl,
  getGoogleCalendarStatus,
  getSyncedMeetings,
} from "../features/scheduler/api";

const defaultPagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
};

const sortByNearestStart = (left, right) =>
  new Date(left.startTime).getTime() - new Date(right.startTime).getTime();

const GOOGLE_REAUTH_REQUIRED = "GOOGLE_REAUTH_REQUIRED";

const ScheduleDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [meetings, setMeetings] = useState([]);
  const [pagination, setPagination] = useState(defaultPagination);
  const [statusFilter, setStatusFilter] = useState("upcoming");
  const [page, setPage] = useState(1);
  const [isLoadingMeetings, setIsLoadingMeetings] = useState(true);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(true);
  const [isDisconnectingGoogle, setIsDisconnectingGoogle] = useState(false);
  const [isCreatingMeeting, setIsCreatingMeeting] = useState(false);
  const [deletingMeetingId, setDeletingMeetingId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [googleStatus, setGoogleStatus] = useState({
    connected: false,
    email: "",
  });
  const [requiresGoogleReconnect, setRequiresGoogleReconnect] = useState(false);

  const loadGoogleStatus = useCallback(async () => {
    try {
      setIsLoadingGoogle(true);
      const data = await getGoogleCalendarStatus();
      setGoogleStatus({
        connected: Boolean(data.connected),
        email: data.email || "",
      });
      setRequiresGoogleReconnect(false);
    } catch (error) {
      setErrorMessage(error.message || "Could not load Google Calendar status.");
    } finally {
      setIsLoadingGoogle(false);
    }
  }, []);

  const loadMeetings = useCallback(async (nextPage, nextStatus) => {
    try {
      setIsLoadingMeetings(true);
      setErrorMessage("");
      setNotice("");
      const data = await getSyncedMeetings({
        status: nextStatus,
      });
      const mergedMeetings = Array.isArray(data.meetings)
        ? [...data.meetings].sort(sortByNearestStart)
        : [
            ...(Array.isArray(data.internalMeetings) ? data.internalMeetings : []),
            ...(Array.isArray(data.externalMeetings) ? data.externalMeetings : []),
          ].sort(sortByNearestStart);
      const pageStart = (nextPage - 1) * defaultPagination.limit;

      setMeetings(
        mergedMeetings.slice(pageStart, pageStart + defaultPagination.limit),
      );
      const needsReconnect =
        data.externalMeetingsError === GOOGLE_REAUTH_REQUIRED;
      setRequiresGoogleReconnect(needsReconnect);
      setGoogleStatus((current) => ({
        ...current,
        connected: needsReconnect ? false : current.connected,
      }));
      setNotice(
        needsReconnect
          ? ""
          : data.externalMeetingsError || "",
      );
      setErrorMessage(
        needsReconnect ? "Your Google connection expired" : "",
      );
      setPagination({
        page: nextPage,
        limit: defaultPagination.limit,
        total: mergedMeetings.length,
        totalPages:
          Math.ceil(mergedMeetings.length / defaultPagination.limit) || 1,
      });
    } catch (error) {
      const needsReconnect = error.message === GOOGLE_REAUTH_REQUIRED;
      setRequiresGoogleReconnect(needsReconnect);
      setErrorMessage(
        needsReconnect
          ? "Your Google connection expired"
          : error.message || "Could not load scheduled meetings.",
      );
    } finally {
      setIsLoadingMeetings(false);
    }
  }, []);

  useEffect(() => {
    loadGoogleStatus();
  }, [loadGoogleStatus]);

  useEffect(() => {
    loadMeetings(page, statusFilter);
  }, [loadMeetings, page, statusFilter]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      loadMeetings(page, statusFilter);
    }, 60000);

    return () => {
      window.clearInterval(interval);
    };
  }, [loadMeetings, page, statusFilter]);

  useEffect(() => {
    const googleState = searchParams.get("google");

    if (!googleState) {
      return;
    }

    let isMounted = true;

    const syncGoogleCallbackState = async () => {
      try {
        const data = await getGoogleCalendarStatus();

        if (!isMounted) {
          return;
        }

        setGoogleStatus({
          connected: Boolean(data.connected),
          email: data.email || "",
        });
        setRequiresGoogleReconnect(false);

        if (googleState === "connected" || googleState === "success") {
          setErrorMessage("");
          setNotice("Google Calendar connected successfully.");
          return;
        }

        if (data.connected) {
          setErrorMessage("");
          setNotice("Google Calendar is already connected.");
        } else {
          setNotice("");
          setErrorMessage("Google Calendar connection failed. Please try again.");
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setNotice("");
        setErrorMessage(
          error.message || "Could not verify Google Calendar connection.",
        );
      } finally {
        if (isMounted) {
          setSearchParams({}, { replace: true });
        }
      }
    };

    syncGoogleCallbackState();

    return () => {
      isMounted = false;
    };
  }, [loadGoogleStatus, searchParams, setSearchParams]);

  const handleConnectGoogle = () => {
    window.location.assign(getGoogleCalendarConnectUrl());
  };

  const handleDisconnectGoogle = async () => {
    try {
      setIsDisconnectingGoogle(true);
      setErrorMessage("");
      setNotice("");

      await disconnectGoogleCalendar();
      setGoogleStatus({
        connected: false,
        email: "",
      });
      setRequiresGoogleReconnect(false);
      setNotice("Google Calendar disconnected successfully.");
      await loadMeetings(page, statusFilter);
    } catch (error) {
      setErrorMessage(error.message || "Could not disconnect Google Calendar.");
    } finally {
      setIsDisconnectingGoogle(false);
    }
  };

  const handleCreateMeeting = async (payload) => {
    setIsCreatingMeeting(true);
    setErrorMessage("");
    setNotice("");

    try {
      await createScheduledMeeting(payload);
      setRequiresGoogleReconnect(false);
      setNotice("Meeting created successfully.");
      setPage(1);
      await loadMeetings(1, statusFilter);
    } catch (error) {
      const needsReconnect = error.message === GOOGLE_REAUTH_REQUIRED;
      setRequiresGoogleReconnect(needsReconnect);
      setErrorMessage(
        needsReconnect
          ? "Your Google connection expired"
          : error.message || "Could not create meeting.",
      );
    } finally {
      setIsCreatingMeeting(false);
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    setDeletingMeetingId(meetingId);
    setErrorMessage("");
    setNotice("");

    try {
      await deleteScheduledMeeting(meetingId);
      setRequiresGoogleReconnect(false);
      setNotice("Meeting deleted successfully.");
      await loadMeetings(page, statusFilter);
    } catch (error) {
      const needsReconnect = error.message === GOOGLE_REAUTH_REQUIRED;
      setRequiresGoogleReconnect(needsReconnect);
      setErrorMessage(
        needsReconnect
          ? "Your Google connection expired"
          : error.message || "Could not delete meeting.",
      );
    } finally {
      setDeletingMeetingId("");
    }
  };

  const handleStatusChange = (nextStatus) => {
    setStatusFilter(nextStatus);
    setPage(1);
  };

  return (
    <section className="min-h-[calc(100svh-81px)] bg-[linear-gradient(180deg,#ffffff_0%,#fbfbfb_55%,#f5f5f5_100%)] px-5 py-8 sm:px-8 lg:px-10 xl:px-12 2xl:px-16">
      <div className="mx-auto max-w-[1440px]">
        <div className="text-center">
          <h1 className="text-4xl font-semibold tracking-[-0.04em] text-[#1f1f1f] sm:text-5xl">
            Meeting Scheduler
          </h1>
        </div>

        {requiresGoogleReconnect && (
          <div className="mt-6 rounded-[1.4rem] border border-yellow-300 bg-yellow-50 px-5 py-4 text-sm text-yellow-900 shadow-[0_10px_30px_rgba(202,138,4,0.08)]">
            <p className="font-semibold">⚠️ Your Google connection expired</p>
            <div className="mt-4">
              <button
                type="button"
                onClick={handleConnectGoogle}
                className="inline-flex items-center justify-center rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-yellow-950 transition hover:bg-yellow-300"
              >
                Reconnect Google Calendar
              </button>
            </div>
          </div>
        )}

        {((errorMessage && !requiresGoogleReconnect) || notice) && (
          <div
            className={`mt-6 rounded-[1.4rem] border px-5 py-4 text-sm ${
              errorMessage
                ? "border-red-200 bg-red-50 text-red-600"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {errorMessage || notice}
          </div>
        )}

        <div className="mt-8 grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
          <div className="space-y-5">
            <ConnectGoogleButton
              isConnected={googleStatus.connected}
              connectedEmail={googleStatus.email}
              isLoading={isLoadingGoogle}
              isDisconnecting={isDisconnectingGoogle}
              onConnect={handleConnectGoogle}
              onDisconnect={handleDisconnectGoogle}
            />
            <CreateMeetingForm
              isSubmitting={isCreatingMeeting}
              isGoogleConnected={googleStatus.connected}
              onSubmit={handleCreateMeeting}
            />
          </div>

          <MeetingList
            meetings={meetings}
            pagination={pagination}
            statusFilter={statusFilter}
            isLoading={isLoadingMeetings}
            isDeletingId={deletingMeetingId}
            onDelete={handleDeleteMeeting}
            onPageChange={setPage}
            onStatusChange={handleStatusChange}
          />
        </div>
      </div>
    </section>
  );
};

export default ScheduleDashboard;
