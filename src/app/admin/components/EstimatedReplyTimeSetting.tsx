"use client";

import { useEffect, useState } from "react";
import { getEstimatedReplyTime } from "@/actions/user";
import { setEstimatedReplyTime } from "@/actions/admin";

export default function EstimatedReplyTimeSetting() {
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch current estimatedReplyTime on mount
  useEffect(() => {
    async function fetchReplyTime() {
      setLoading(true);
      setError(null);
      try {
        const res = await getEstimatedReplyTime();
        if (res.status === 200 && res.estimatedReplyTime?.estimatedReplyTime) {
          setSelectedTimeFilter(res.estimatedReplyTime.estimatedReplyTime);
        } else {
          setError("Failed to fetch current reply time");
        }
      } catch (e) {
        setError("Error fetching reply time");
        console.log(e);
      } finally {
        setLoading(false);
      }
    }
    fetchReplyTime();
  }, []);

  // Handler for changing the value
  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    setSelectedTimeFilter(value);
    setSaving(true);
    setError(null);
    try {
      const res = await setEstimatedReplyTime(value);
      if (!res.success) {
        setError("Failed to update reply time");
      }
    } catch (e) {
      setError("Error updating reply time");
      console.log(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {/* <label htmlFor="reply-time" className="block mb-2 font-medium">
        Estimated Reply Time (hours)
      </label> */}
      <select
        id="reply-time"
        value={selectedTimeFilter ?? ""}
        onChange={handleChange}
        disabled={saving}
        className="border rounded px-2 py-1"
      >
        <option value="" disabled>
          Select time
        </option>
        <option value={0.25}>15 minutes</option>
        <option value={0.5}>30 minutes</option>
        <option value={1}>1 hour</option>
        <option value={2}>2 hours</option>
        <option value={4}>4 hours</option>
      </select>
      {saving && <span className="ml-2 text-xs text-gray-500">Saving...</span>}
      {error && <div className="text-red-500 text-xs mt-2">{error}</div>}
    </div>
  );
}
