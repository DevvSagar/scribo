import { useState } from "react";

const initialState = {
  title: "",
  description: "",
  startTime: "",
  endTime: "",
  platform: "gmeet",
  meetingLink: "",
  attendees: "",
};

const parseAttendees = (value) =>
  value
    .split(/[\n,]/)
    .map((email) => email.trim())
    .filter(Boolean);

const CreateMeetingForm = ({ isSubmitting, isGoogleConnected, onSubmit }) => {
  const [formState, setFormState] = useState(initialState);
  const [formError, setFormError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (formState.platform === "gmeet" && !isGoogleConnected) {
      setFormError("Connect Google Calendar before creating Google Meet meetings.");
      return;
    }

    if (!formState.title.trim()) {
      setFormError("Title is required.");
      return;
    }

    if (!formState.startTime || !formState.endTime) {
      setFormError("Start time and end time are required.");
      return;
    }

    if (
      (formState.platform === "zoom" || formState.platform === "teams") &&
      !formState.meetingLink.trim()
    ) {
      setFormError("Paste the meeting link for Zoom or Teams meetings.");
      return;
    }

    try {
      await onSubmit({
        ...formState,
        meetingLink: formState.meetingLink.trim(),
        attendees: parseAttendees(formState.attendees),
      });
      setFormState(initialState);
    } catch (error) {
      setFormError(error.message || "Could not create meeting.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[1.8rem] border border-black/8 bg-white p-5 shadow-[0_18px_48px_rgba(0,0,0,0.05)] sm:p-6"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7a7a7a]">
          Create Meeting
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-[#1f1f1f]">
          Create a meeting
        </h2>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-[#1f1f1f]">Title</span>
          <input
            name="title"
            value={formState.title}
            onChange={handleChange}
            placeholder="Weekly leadership sync"
            className="w-full rounded-[1rem] border border-black/10 bg-[#fafafa] px-4 py-3 text-sm outline-none transition focus:border-black/20"
          />
        </label>

        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-[#1f1f1f]">Description</span>
          <textarea
            name="description"
            value={formState.description}
            onChange={handleChange}
            rows={4}
            placeholder="Agenda, goals, and notes for attendees"
            className="w-full resize-none rounded-[1rem] border border-black/10 bg-[#fafafa] px-4 py-3 text-sm outline-none transition focus:border-black/20"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[#1f1f1f]">Start Time</span>
          <input
            type="datetime-local"
            name="startTime"
            value={formState.startTime}
            onChange={handleChange}
            className="w-full rounded-[1rem] border border-black/10 bg-[#fafafa] px-4 py-3 text-sm outline-none transition focus:border-black/20"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[#1f1f1f]">End Time</span>
          <input
            type="datetime-local"
            name="endTime"
            value={formState.endTime}
            onChange={handleChange}
            className="w-full rounded-[1rem] border border-black/10 bg-[#fafafa] px-4 py-3 text-sm outline-none transition focus:border-black/20"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[#1f1f1f]">Platform</span>
          <select
            name="platform"
            value={formState.platform}
            onChange={handleChange}
            className="w-full rounded-[1rem] border border-black/10 bg-[#fafafa] px-4 py-3 text-sm outline-none transition focus:border-black/20"
          >
            <option value="gmeet">Google Meet</option>
            <option value="zoom">Zoom</option>
            <option value="teams">Microsoft Teams</option>
          </select>
        </label>

        {formState.platform !== "gmeet" && (
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-[#1f1f1f]">
              Paste meeting link
            </span>
            <input
              name="meetingLink"
              value={formState.meetingLink}
              onChange={handleChange}
              placeholder={
                formState.platform === "zoom"
                  ? "https://zoom.us/j/..."
                  : "https://teams.microsoft.com/..."
              }
              className="w-full rounded-[1rem] border border-black/10 bg-[#fafafa] px-4 py-3 text-sm outline-none transition focus:border-black/20"
            />
          </label>
        )}

        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-[#1f1f1f]">
            Attendees
          </span>
          <textarea
            name="attendees"
            value={formState.attendees}
            onChange={handleChange}
            rows={4}
            placeholder="jane@example.com, alex@example.com"
            className="w-full resize-none rounded-[1rem] border border-black/10 bg-[#fafafa] px-4 py-3 text-sm outline-none transition focus:border-black/20"
          />
          <span className="mt-2 block text-xs text-[#666666]">
            Separate email addresses with commas or new lines.
          </span>
        </label>
      </div>

      {formError && (
        <div className="mt-4 rounded-[1rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {formError}
        </div>
      )}

      {formState.platform === "gmeet" && !isGoogleConnected && (
        <div className="mt-4 rounded-[1rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Connect Google Calendar to create Google Meet meetings automatically.
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-5 inline-flex items-center justify-center rounded-full bg-[#1f1f1f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Creating..." : "Create Meeting"}
      </button>
    </form>
  );
};

export default CreateMeetingForm;
