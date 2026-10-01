"use client";
import { useEffect, useState } from "react";
import CollectionsDashboard from "@/components/home/CollectionsDashboard";
import { collectionsDashboardData } from "@/components/home/collectionsDashboardData";
import { getHomeDashboard } from "@/app/lib/api";

export default function DashboardPage() {
  const [homeData, setHomeData] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadHomeData() {
      try {
        const data = await getHomeDashboard();
        const payload = data?.data ?? data;
        if (isMounted && payload && typeof payload === "object") {
          setHomeData(payload);
        }
      } catch {
        // Keep static presentation available when the dashboard API is unavailable.
      }
    }

    loadHomeData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <CollectionsDashboard data={homeData?.collectionsDashboard ?? collectionsDashboardData} />
  );
}
