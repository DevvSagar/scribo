const ConnectGoogleButton = ({
  isConnected,
  connectedEmail,
  isLoading,
  isDisconnecting,
  onConnect,
  onDisconnect,
}) => (
  <div className="rounded-[1.8rem] border border-black/8 bg-white p-5 shadow-[0_18px_48px_rgba(0,0,0,0.05)]">
    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7a7a7a]">
      Google Calendar
    </p>
    <div className="mt-3 flex items-center gap-3">
      <span
        className={`inline-flex h-3.5 w-3.5 rounded-full ${
          isConnected ? "bg-emerald-500" : "bg-red-500"
        }`}
      />
      <h2 className="text-2xl font-semibold text-[#1f1f1f]">
        {isConnected ? "Connected" : "Connect your calendar"}
      </h2>
    </div>
    <p className="mt-2 text-sm leading-6 text-[#5f5f5f]">
      {isConnected
        ? `Google Calendar is connected${connectedEmail ? ` as ${connectedEmail}` : ""}. New meetings will create a Google Calendar event and a Meet link automatically.`
        : "Connect Google Calendar once to create Meet-enabled meetings directly from Scribo."}
    </p>

    <div className="mt-5 flex flex-wrap gap-3">
      <button
        type="button"
        disabled={isLoading || isDisconnecting}
        onClick={onConnect}
        className="inline-flex items-center justify-center rounded-full bg-[#1f1f1f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isConnected ? "Change account" : "Connect Google Calendar"}
      </button>

      {isConnected && (
        <button
          type="button"
          disabled={isLoading || isDisconnecting}
          onClick={onDisconnect}
          className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-[#1f1f1f] transition hover:bg-[#fafafa] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isDisconnecting ? "Disconnecting..." : "Disconnect"}
        </button>
      )}
    </div>
  </div>
);

export default ConnectGoogleButton;
