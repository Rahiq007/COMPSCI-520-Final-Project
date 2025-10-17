import type React from "react"
import { safeToFixed, formatVolume } from "@/lib/utils/safe-formatters"

interface APIUsageMonitorProps {
  usage: {
    avg_response_time: number | null
    success_rate: number | null
    total_requests: number | null
  }
}

const APIUsageMonitor: React.FC<APIUsageMonitorProps> = ({ usage }) => {
  return (
    <div>
      <h3>API Usage Monitor</h3>
      <p>Average Response Time: {safeToFixed(usage.avg_response_time, 0)} ms</p>
      <p>Success Rate: {safeToFixed(usage.success_rate, 1)}%</p>
      <p>Total Requests: {formatVolume(usage.total_requests)}</p>
    </div>
  )
}

export default APIUsageMonitor
