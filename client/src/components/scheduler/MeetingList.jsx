const formatDateRange = (startTime, endTime) => {
  const start = new Date(startTime).toLocaleString();
  const end = new Date(endTime).toLocaleString();

  return `${start} - ${end}`;
};

const capitalize = (value) =>
  typeof value === "string" && value.length > 0
    ? `${value[0].toUpperCase()}${value.slice(1)}`
    : value;

const formatPlatformLabel = (platform) => {
  if (platform === "gmeet") return "GMeet";
  if (platform === "zoom") return "Zoom";
  if (platform === "teams") return "Teams";
  return "No Link";
};

const MeetingList = ({
  meetings,
  pagination,
  statusFilter,
  isLoading,
  isDeletingId,
  onDelete,
  onPageChange,
  onStatusChange,
}) => (
  <div className="rounded-[1.8rem] border border-black/8 bg-white p-5 shadow-[0_18px_48px_rgba(0,0,0,0.05)] sm:p-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7a7a7a]">
          Meetings
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-[#1f1f1f]">
          Upcoming and completed meetings
        </h2>
      </div>

      <div className="inline-flex rounded-full border border-black/10 bg-[#fafafa] p-1">
        {["upcoming", "completed"].map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => onStatusChange(status)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              statusFilter === status
                ? "bg-[#1f1f1f] text-white"
                : "text-[#666666]"
            }`}
          >
            {capitalize(status)}
          </button>
        ))}
      </div>
    </div>

    <div className="mt-5 space-y-4">
      {isLoading ? (
        <div className="rounded-[1.4rem] border border-black/8 bg-[#fafafa] px-4 py-5 text-sm text-[#666666]">
          Loading meetings...
        </div>
      ) : meetings.length === 0 ? (
        <div className="rounded-[1.4rem] border border-black/8 bg-[#fafafa] px-4 py-5 text-sm text-[#666666]">
          No meetings found for this view.
        </div>
      ) : (
        meetings.map((meeting) => (
          <article
            key={meeting.id}
            className="rounded-[1.5rem] border border-black/8 bg-[#fafafa] p-5"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7a7a7a]">
                  {capitalize(meeting.status)}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-[#1f1f1f]">
                    {capitalize(meeting.source)}
                  </span>
                  <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-[#1f1f1f]">
                    {formatPlatformLabel(meeting.platform)}
                  </span>
                </div>
                <h3 className="mt-2 text-xl font-semibold text-[#1f1f1f]">
                  {meeting.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#5f5f5f]">
                  {formatDateRange(meeting.startTime, meeting.endTime)}
                </p>
                {meeting.description && (
                  <p className="mt-3 text-sm leading-7 text-[#3a3a3a]">
                    {meeting.description}
                  </p>
                )}
                {meeting.attendees?.length > 0 && (
                  <p className="mt-3 text-xs leading-6 text-[#666666]">
                    Attendees: {meeting.attendees.join(", ")}
                  </p>
                )}
                {!meeting.meetingLink && (
                  <p className="mt-3 text-xs leading-6 text-[#666666]">
                    Join link not available.
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {meeting.meetingLink && (
                  <a
                    href={meeting.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-full bg-[#1f1f1f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-black"
                  >
                    Join Link
                  </a>
                )}
                {meeting.source === "internal" && (
                  <button
                    type="button"
                    onClick={() => onDelete(meeting.id)}
                    disabled={isDeletingId === meeting.id}
                    className="inline-flex items-center justify-center rounded-full border border-black/10 px-4 py-2.5 text-sm font-semibold text-[#1f1f1f] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isDeletingId === meeting.id ? "Deleting..." : "Delete"}
                  </button>
                )}
              </div>
            </div>
          </article>
        ))
      )}
    </div>

    <div className="mt-5 flex flex-col gap-3 border-t border-black/8 pt-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-[#666666]">
        Page {pagination.page} of {pagination.totalPages}
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
          disabled={pagination.page <= 1}
          className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-[#1f1f1f] transition hover:bg-[#fafafa] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(pagination.totalPages, pagination.page + 1))}
          disabled={pagination.page >= pagination.totalPages}
          className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-[#1f1f1f] transition hover:bg-[#fafafa] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  </div>
);

export default MeetingList;
