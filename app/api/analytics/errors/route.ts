import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const days = Number(searchParams.get("days")) || 7

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const [errorSummary, errorTrends, topErrors, resolutionStats] = await Promise.all([
      // Error summary
      sql`
        SELECT 
          error_type,
          COUNT(*) as total_errors,
          COUNT(CASE WHEN retryable THEN 1 END) as retryable_errors,
          COUNT(CASE WHEN resolved THEN 1 END) as resolved_errors,
          AVG(CASE WHEN resolved THEN 1.0 ELSE 0.0 END) * 100 as resolution_rate
        FROM error_logs 
        WHERE timestamp >= ${startDate.toISOString()}
        GROUP BY error_type
        ORDER BY total_errors DESC
      `,

      // Error trends over time
      sql`
        SELECT 
          DATE(timestamp) as error_date,
          error_type,
          COUNT(*) as error_count
        FROM error_logs 
        WHERE timestamp >= ${startDate.toISOString()}
        GROUP BY DATE(timestamp), error_type
        ORDER BY error_date DESC
      `,

      // Top error messages
      sql`
        SELECT 
          message,
          error_type,
          COUNT(*) as occurrence_count,
          MAX(timestamp) as last_occurrence
        FROM error_logs 
        WHERE timestamp >= ${startDate.toISOString()}
        GROUP BY message, error_type
        ORDER BY occurrence_count DESC
        LIMIT 10
      `,

      // Resolution statistics
      sql`
        SELECT 
          COUNT(*) as total_errors,
          COUNT(CASE WHEN resolved THEN 1 END) as resolved_errors,
          COUNT(CASE WHEN retryable THEN 1 END) as retryable_errors,
          AVG(CASE WHEN resolved THEN 1.0 ELSE 0.0 END) * 100 as overall_resolution_rate
        FROM error_logs 
        WHERE timestamp >= ${startDate.toISOString()}
      `,
    ])

    return NextResponse.json({
      period: `${days} days`,
      summary: {
        total_errors: resolutionStats[0]?.total_errors || 0,
        resolved_errors: resolutionStats[0]?.resolved_errors || 0,
        retryable_errors: resolutionStats[0]?.retryable_errors || 0,
        resolution_rate: Number(resolutionStats[0]?.overall_resolution_rate || 0).toFixed(1),
      },
      error_by_type: errorSummary,
      error_trends: errorTrends,
      top_errors: topErrors,
    })
  } catch (error) {
    console.error("Error fetching error analytics:", error)
    return NextResponse.json({ error: "Failed to fetch error analytics" }, { status: 500 })
  }
}
