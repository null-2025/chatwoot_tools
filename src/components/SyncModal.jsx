import { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";

export function SyncModal({ isOpen, onClose, accountId, apiToken, items }) {
  const [logs, setLogs] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const logEndRef = useRef(null);

  const addLog = (message, type = "info") => {
    setLogs((prev) => [
      ...prev,
      { message, type, time: new Date().toLocaleTimeString() },
    ]);
  };

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  useEffect(() => {
    if (isOpen && !isSyncing) {
      startSync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  const startSync = async () => {
    setIsSyncing(true);
    setLogs([]);
    addLog("Started sync process...", "info");

    const headers = {
      "Content-Type": "application/json",
      api_access_token: apiToken,
    };

    const baseUrl = import.meta.env.DEV
      ? `/chatwoot-api/api/v1/accounts/${accountId}/automation_rules`
      : `https://app.chatwoot.com/api/v1/accounts/${accountId}/automation_rules`;

    try {
      // Step 1: Fetch Existing Rules
      addLog("Fetching existing automation rules...", "info");
      const fetchRes = await fetch(`${baseUrl}?page=1`, {
        method: "GET",
        headers,
      });

      if (fetchRes.status === 403) {
        throw new Error(
          "403 Unauthorized. Please check your API access token.",
        );
      }
      if (!fetchRes.ok) {
        throw new Error(
          `Failed to fetch existing rules. Status: ${fetchRes.status}`,
        );
      }

      const fetchData = await fetchRes.json();
      const existingRules = fetchData.payload || [];
      const apiRules = existingRules.filter(
        (rule) => rule.description === "[api]",
      );

      addLog(`Found ${apiRules.length} existing [api] rules.`, "info");

      // Step 2: Delete Old Rules
      if (apiRules.length > 0) {
        addLog("Deleting old rules...", "info");
        for (const rule of apiRules) {
          try {
            const delRes = await fetch(`${baseUrl}/${rule.id}`, {
              method: "DELETE",
              headers,
            });
            if (delRes.status === 200 || delRes.status === 404) {
              addLog(`Deleted rule: ${rule.id} (${rule.name})`, "success");
            } else if (delRes.status === 403) {
              throw new Error("403 Unauthorized while deleting rule.");
            } else {
              addLog(
                `Failed to delete rule: ${rule.id} (Status: ${delRes.status})`,
                "error",
              );
            }
          } catch (e) {
            addLog(`Error deleting rule ${rule.id}: ${e.message}`, "error");
            throw e;
          }
          await delay(200); // Rate limit protection
        }
      }

      // Step 3: Create New Rules
      addLog("Creating new automation rules...", "info");
      let rulesCreated = 0;
      const allKeywords = [];

      for (const item of items) {
        if (
          !item.intent?.trim() ||
          !item.keywords?.trim() ||
          !item.response?.trim()
        ) {
          continue;
        }

        const keywords = item.keywords
          .split(",")
          .map((k) => k.trim())
          .filter((k) => k);

        for (const keyword of keywords) {
          allKeywords.push(keyword);
          const payload = {
            name: `${item.intent.trim()} for "${keyword}"`,
            description: "[api]",
            event_name: "message_created",
            active: item.active !== false,
            actions: [
              {
                action_name: "send_message",
                action_params: [item.response.trim()],
              },
            ],
            conditions: [
              {
                values: ["incoming"],
                attribute_key: "message_type",
                query_operator: "and",
                filter_operator: "equal_to",
                custom_attribute_type: "",
              },
              {
                values: [keyword],
                attribute_key: "content",
                query_operator: "and",
                filter_operator: "contains",
                custom_attribute_type: "",
              },
              {
                values: ["need_attention"],
                attribute_key: "labels",
                filter_operator: "not_equal_to",
                custom_attribute_type: "",
              },
            ],
          };

          try {
            const createRes = await fetch(baseUrl, {
              method: "POST",
              headers,
              body: JSON.stringify(payload),
            });

            if (createRes.ok) {
              const data = await createRes.json();
              addLog(`Created rule: ${data.id} (${payload.name})`, "success");
              rulesCreated++;
            } else {
              addLog(
                `Failed to create rule: "${payload.name}" (Status: ${createRes.status})`,
                "error",
              );
            }
          } catch (e) {
            addLog(`Error creating rule: ${e.message}`, "error");
          }
          await delay(200); // Rate limit protection
        }
      }

      // Step 4: Create final catch-all rule
      if (allKeywords.length > 0) {
        addLog("Creating final 'Remove auto_reply label' rule...", "info");
        const finalConditions = [
          {
            values: ["incoming"],
            attribute_key: "message_type",
            query_operator: "and",
            filter_operator: "equal_to",
            custom_attribute_type: "",
          },
          {
            values: ["auto_reply"],
            attribute_key: "labels",
            query_operator: "and",
            filter_operator: "equal_to",
            custom_attribute_type: "",
          },
        ];

        for (const keyword of Array.from(new Set(allKeywords))) {
          finalConditions.push({
            values: [keyword],
            attribute_key: "content",
            query_operator: "and",
            filter_operator: "does_not_contain",
            custom_attribute_type: "",
          });
        }

        const finalPayload = {
          name: 'Remove "auto_reply" label',
          description: "[api]",
          event_name: "message_created",
          active: true,
          actions: [
            {
              action_name: "remove_label",
              action_params: ["auto_reply"],
            },
            {
              action_name: "add_label",
              action_params: ["need_attention"],
            },
          ],
          conditions: finalConditions,
        };

        try {
          const createFinalRes = await fetch(baseUrl, {
            method: "POST",
            headers,
            body: JSON.stringify(finalPayload),
          });
          if (createFinalRes.ok) {
            const data = await createFinalRes.json();
            addLog(
              `Created final rule: ${data.id} (${finalPayload.name})`,
              "success",
            );
            rulesCreated++;
          } else {
            addLog(
              `Failed to create final rule (Status: ${createFinalRes.status})`,
              "error",
            );
          }
        } catch (e) {
          addLog(`Error creating final rule: ${e.message}`, "error");
        }
        await delay(200);
      }

      addLog(
        `Sync completed! Successfully created ${rulesCreated} rules.`,
        "success",
      );
    } catch (error) {
      addLog(`Sync aborted: ${error.message}`, "error");
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white border border-zinc-200 rounded-xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/80">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Icon
              icon="heroicons:arrow-path"
              className={`w-5 h-5 text-indigo-600 ${isSyncing ? "animate-spin" : ""}`}
            />
            Synchronization Status
          </h2>
          <button
            onClick={onClose}
            disabled={isSyncing}
            className="text-zinc-400 hover:text-zinc-600 disabled:opacity-50 transition-colors"
          >
            <Icon icon="heroicons:x-mark" className="w-5 h-5" />
          </button>
        </div>

        {/* Log Viewer */}
        <div className="flex-1 overflow-y-auto p-4 bg-zinc-950 font-mono text-sm">
          {logs.map((log, index) => (
            <div
              key={index}
              className="mb-2 leading-relaxed break-words flex gap-3"
            >
              <span className="text-zinc-500 shrink-0 select-none">
                [{log.time}]
              </span>
              <span
                className={
                  log.type === "error"
                    ? "text-red-400 font-semibold"
                    : log.type === "success"
                      ? "text-emerald-400"
                      : "text-zinc-300"
                }
              >
                {log.message}
              </span>
            </div>
          ))}
          <div ref={logEndRef} />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-100 flex justify-end bg-zinc-50/80">
          <button
            onClick={onClose}
            disabled={isSyncing}
            className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-md hover:bg-zinc-800 disabled:opacity-50 transition-colors"
          >
            {isSyncing ? "Syncing..." : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
