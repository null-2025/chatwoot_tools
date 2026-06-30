import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { getAllItems, addItem, updateItem, deleteItem, clearItems } from "../utils/db";

export function Automation({ navigate }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        const data = await getAllItems();
        if (active) {
          setItems(data);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error loading items from DB:", err);
        if (active) setLoading(false);
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, []);

  const handleAddNew = async () => {
    const newItem = { intent: "", keywords: "", response: "" };
    try {
      const id = await addItem(newItem);
      setItems((prev) => [...prev, { ...newItem, id }]);
    } catch (error) {
      console.error("Failed to add item:", error);
    }
  };

  const handleFieldChange = (id, field, value) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const handleFieldBlur = async (item) => {
    try {
      await updateItem(item);
    } catch (error) {
      console.error("Failed to update item:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteItem(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  };

  const [colWidths, setColWidths] = useState({
    intent: 180,
    keywords: 260,
    response: 460,
  });

  const handleMouseDown = (e, colName) => {
    e.preventDefault();
    const startX = e.pageX;
    const startWidth = colWidths[colName];

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.pageX - startX;
      setColWidths((prev) => ({
        ...prev,
        [colName]: Math.max(80, startWidth + deltaX),
      }));
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleExport = () => {
    const validItems = items
      .filter((item) => {
        const intent = (item.intent || "").trim();
        const keywords = (item.keywords || "").trim();
        const response = (item.response || "").trim();
        return intent !== "" || keywords !== "" || response !== "";
      })
      .map(({ intent, keywords, response }) => ({
        intent: intent || "",
        keywords: keywords || "",
        response: response || "",
      }));

    if (validItems.length === 0) {
      alert("No rules with content to export.");
      return;
    }

    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(validItems, null, 2));
    const downloadAnchor = document.createElement("a");

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const min = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
    const timestamp = `${yyyy}${mm}${dd}_${hh}${min}${ss}`;

    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `automation_rules_${timestamp}.json`,
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!Array.isArray(parsed)) {
          alert(
            "Invalid file format. The file must contain a JSON array of rules.",
          );
          return;
        }

        const validItems = parsed
          .filter((item) => {
            if (!item || typeof item !== "object") return false;
            const intent = (item.intent || "").trim();
            const keywords = (item.keywords || "").trim();
            const response = (item.response || "").trim();
            return intent !== "" || keywords !== "" || response !== "";
          })
          .map((item) => ({
            intent: (item.intent || "").trim(),
            keywords: (item.keywords || "").trim(),
            response: (item.response || "").trim(),
          }));

        if (validItems.length === 0) {
          alert("No valid automation rules found in the imported file.");
          return;
        }

        // Wipe out existing data since validation passed
        await clearItems();

        const addedItems = [];
        for (const item of validItems) {
          const id = await addItem(item);
          addedItems.push({ ...item, id });
        }

        setItems(addedItems);
        alert(`Successfully imported ${validItems.length} rules!`);
      } catch (err) {
        console.error("Failed to parse JSON file:", err);
        alert(
          "Failed to parse the file. Please check that it is a valid JSON file.",
        );
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-white overflow-hidden w-full h-full">
      {/* Table Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-b border-zinc-200 bg-zinc-50/50 shrink-0 select-none">
        <span className="text-sm font-semibold text-zinc-800">
          Automation Rules
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="file"
            accept=".json"
            id="import-json-file"
            onChange={handleImport}
            className="hidden"
          />
          <label
            htmlFor="import-json-file"
            title="Import from JSON file"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 hover:text-zinc-900 shadow-sm transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-zinc-950 text-xs font-medium"
          >
            <Icon icon="lucide:upload" className="w-3.5 h-3.5" />
            Import
          </label>
          <button
            onClick={handleExport}
            title="Export to JSON file"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 hover:text-zinc-900 shadow-sm transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-zinc-950 text-xs font-medium"
          >
            <Icon icon="lucide:download" className="w-3.5 h-3.5" />
            Export
          </button>
          <button
            onClick={handleAddNew}
            title="Add new row"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 hover:text-zinc-900 shadow-sm transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-zinc-950 text-xs font-medium"
          >
            <Icon icon="lucide:plus" className="w-3.5 h-3.5" />
            Add
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto min-h-0">
        <table
          className="min-w-full border-collapse text-left text-sm text-zinc-600 table-fixed"
          style={{
            width: `${48 + colWidths.intent + colWidths.keywords + colWidths.response + 64}px`,
          }}
        >
          <colgroup>
            <col style={{ width: "48px" }} />
            <col style={{ width: `${colWidths.intent}px` }} />
            <col style={{ width: `${colWidths.keywords}px` }} />
            <col style={{ width: `${colWidths.response}px` }} />
            <col style={{ width: "64px" }} />
          </colgroup>
          <thead className="bg-zinc-50 text-zinc-700 text-xs font-semibold select-none sticky top-0 z-10 border-b border-zinc-200">
            <tr>
              <th className="w-12 px-3 py-2 border-r border-zinc-200 bg-zinc-100/50 text-center text-zinc-400 font-mono">
                #
              </th>
              <th className="relative px-4 py-2 border-r border-zinc-200">
                <span className="block truncate pr-2">Intent</span>
                <div
                  onMouseDown={(e) => handleMouseDown(e, "intent")}
                  className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-zinc-300 active:bg-zinc-500 transition-colors z-20 select-none"
                />
              </th>
              <th className="relative px-4 py-2 border-r border-zinc-200">
                <span className="block truncate pr-2">
                  Keywords (comma separated)
                </span>
                <div
                  onMouseDown={(e) => handleMouseDown(e, "keywords")}
                  className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-zinc-300 active:bg-zinc-500 transition-colors z-20 select-none"
                />
              </th>
              <th className="relative px-4 py-2 border-r border-zinc-200">
                <span className="block truncate pr-2">Response</span>
                <div
                  onMouseDown={(e) => handleMouseDown(e, "response")}
                  className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-zinc-300 active:bg-zinc-500 transition-colors z-20 select-none"
                />
              </th>
              <th className="w-16 px-3 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="px-3 py-3 border-r border-zinc-200 bg-zinc-50/50 text-center">
                    <div className="h-3 w-4 bg-zinc-200 rounded mx-auto" />
                  </td>
                  <td className="p-3 border-r border-zinc-200">
                    <div className="h-4 bg-zinc-200 rounded w-3/4" />
                  </td>
                  <td className="p-3 border-r border-zinc-200">
                    <div className="h-4 bg-zinc-200 rounded w-5/6" />
                  </td>
                  <td className="p-3 border-r border-zinc-200">
                    <div className="h-4 bg-zinc-200 rounded w-full" />
                  </td>
                  <td className="p-3 text-center">
                    <div className="h-6 w-6 bg-zinc-200 rounded mx-auto" />
                  </td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-12 text-zinc-400 text-sm"
                >
                  No items found. Click "Add Row" to create one.
                </td>
              </tr>
            ) : (
              items.map((item, index) => (
                <tr
                  key={item.id}
                  className="hover:bg-zinc-50/30 transition-colors"
                >
                  <td className="px-3 py-2.5 border-r border-zinc-200 bg-zinc-50/30 text-center font-mono text-xs text-zinc-400 select-none align-top">
                    {index + 1}
                  </td>
                  <td className="p-0 border-r border-zinc-200 align-top">
                    <textarea
                      value={item.intent || ""}
                      onChange={(e) => {
                        handleFieldChange(item.id, "intent", e.target.value);
                        e.target.style.height = "auto";
                        e.target.style.height = `${e.target.scrollHeight}px`;
                      }}
                      onBlur={() => handleFieldBlur(item)}
                      ref={(el) => {
                        if (el) {
                          el.style.height = "auto";
                          el.style.height = `${el.scrollHeight}px`;
                        }
                      }}
                      placeholder="e.g. greeting"
                      rows={1}
                      className="w-full bg-transparent px-3 py-2 text-sm border-0 focus:ring-1 focus:ring-inset focus:ring-zinc-950 focus:bg-white focus:outline-none focus:relative focus:z-10 resize-none transition-all font-medium text-zinc-800 leading-relaxed overflow-hidden block min-h-[38px]"
                    />
                  </td>
                  <td className="p-0 border-r border-zinc-200 align-top">
                    <textarea
                      value={item.keywords || ""}
                      onChange={(e) => {
                        handleFieldChange(item.id, "keywords", e.target.value);
                        e.target.style.height = "auto";
                        e.target.style.height = `${e.target.scrollHeight}px`;
                      }}
                      onBlur={() => handleFieldBlur(item)}
                      ref={(el) => {
                        if (el) {
                          el.style.height = "auto";
                          el.style.height = `${el.scrollHeight}px`;
                        }
                      }}
                      placeholder="hi, hello, hey"
                      rows={1}
                      className="w-full bg-transparent px-3 py-2 text-sm border-0 focus:ring-1 focus:ring-inset focus:ring-zinc-950 focus:bg-white focus:outline-none focus:relative focus:z-10 resize-none transition-all text-zinc-600 leading-relaxed overflow-hidden block min-h-[38px]"
                    />
                  </td>
                  <td className="p-0 border-r border-zinc-200 align-top">
                    <textarea
                      value={item.response || ""}
                      onChange={(e) => {
                        handleFieldChange(item.id, "response", e.target.value);
                        e.target.style.height = "auto";
                        e.target.style.height = `${e.target.scrollHeight}px`;
                      }}
                      onBlur={() => handleFieldBlur(item)}
                      ref={(el) => {
                        if (el) {
                          el.style.height = "auto";
                          el.style.height = `${el.scrollHeight}px`;
                        }
                      }}
                      placeholder="Type response response message..."
                      rows={1}
                      className="w-full bg-transparent px-3 py-2 text-sm border-0 focus:ring-1 focus:ring-inset focus:ring-zinc-950 focus:bg-white focus:outline-none focus:relative focus:z-10 resize-none transition-all text-zinc-600 leading-relaxed overflow-hidden block min-h-[38px]"
                    />
                  </td>
                  <td className="p-0 text-center align-top">
                    <div className="flex items-center justify-center py-1">
                      <button
                        onClick={() => handleDelete(item.id)}
                        title="Delete row"
                        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-red-50 text-zinc-400 hover:text-red-600 transition-all cursor-pointer border border-transparent hover:border-red-100"
                      >
                        <Icon icon="lucide:trash-2" className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
