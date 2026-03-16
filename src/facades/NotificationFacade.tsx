import toast from "react-hot-toast";

export const NotificationFacade = {
  success: (message: string) => toast.success(message),

  error: (message: string) => toast.error(message),

  confirmDelete: (message: string, onConfirm: () => Promise<void>) => {
    toast(
      (t) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px", alignItems: "center" }}>
          <p style={{ margin: 0, fontWeight: "500", color: "#fff" }}>{message}</p>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                await onConfirm();
              }}
              style={{
                padding: "8px 16px",
                background: "#ef4444",
                color: "white",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Yes, Delete
            </button>

            <button
              onClick={() => toast.dismiss(t.id)}
              style={{
                padding: "8px 16px",
                background: "#374151",
                color: "white",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: Infinity, style: { background: "#1e293b", border: "1px solid #334155" } }
    );
  },
};