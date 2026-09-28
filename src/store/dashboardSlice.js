import { createSlice } from "@reduxjs/toolkit";
import { dashboardMock } from "@/data/dashboardMock";

const initialState = {
  activeDateRange: "This Month",
  metrics: dashboardMock.metrics,
  lineTrend: dashboardMock.lineTrend,
  slaCompliance: dashboardMock.slaCompliance,
  exceptionsByCategory: dashboardMock.exceptionsByCategory,
  topVendors: dashboardMock.topVendors,
  analystWorkload: dashboardMock.analystWorkload,
  reconciliationStatus: dashboardMock.reconciliationStatus,
  financialTotals: dashboardMock.financialTotals,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setActiveDateRange(state, action) {
      state.activeDateRange = action.payload;
    },
  },
});

export const { setActiveDateRange } = dashboardSlice.actions;
export default dashboardSlice.reducer;