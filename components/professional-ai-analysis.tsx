import type React from "react"

interface StockData {
  currentPrice?: number
  prediction?: {
    targetPrice?: number
  }
}

interface Analysis {
  targetPrice?: number
}

interface ProfessionalAIAnalysisProps {
  stockData?: StockData
  analysis?: Analysis
}

const ProfessionalAIAnalysis: React.FC<ProfessionalAIAnalysisProps> = ({ stockData, analysis }) => {
  // Ensure consistent target price from stockData
  const getConsistentTargetPrice = () => {
    if (stockData?.prediction?.targetPrice) {
      return stockData.prediction.targetPrice
    }
    if (analysis?.targetPrice) {
      return analysis.targetPrice
    }
    return stockData?.currentPrice || 0
  }

  return (
    <div>
      <div className="text-sm">
        <span className="font-medium">AI Price Target:</span> ${getConsistentTargetPrice().toFixed(2)}
      </div>
    </div>
  )
}

export default ProfessionalAIAnalysis
