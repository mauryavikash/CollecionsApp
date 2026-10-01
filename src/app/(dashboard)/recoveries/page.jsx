"use client";

import PromiseToPayBoard, { promiseToPayData } from "@/components/recoveries/PromiseToPayBoard";

export default function PromiseToPayPage() {
  return <PromiseToPayBoard data={promiseToPayData} />;
}
