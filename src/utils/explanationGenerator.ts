import { Question } from '../types';

// AWS service knowledge base for generating explanations
const awsServiceKnowledge: Record<string, string> = {
    // SageMaker Inference Types
    'serverless inference': `**SageMaker Serverless Inference** 適用於間歇性、不可預測的流量。自動擴展到零，無需管理底層基礎設施。最適合每天只運行幾次或流量不穩定的工作負載。`,
    'real-time inference': `**SageMaker Real-time Inference** 提供持續運行的端點，適合需要低延遲響應的應用。需要持續支付運行成本，即使沒有流量。`,
    'asynchronous inference': `**SageMaker Asynchronous Inference** 適用於大型負載（最大 1GB）和長時間處理（最長 15 分鐘）。但無法縮放到 0 個實例。`,
    'batch transform': `**SageMaker Batch Transform** 適用於離線批量處理整個數據集，不適合實時或按需預測。`,

    // Model Monitoring
    'model monitor': `**SageMaker Model Monitor** 用於檢測數據質量、模型質量、偏差漂移和特徵歸因漂移。當檢測到問題時，應該更新基線而不是重新訓練模型。`,
    'baseline': `數據質量**基線 (Baseline)** 定義了模型期望的數據分佈。當數據分佈改變時，應該創建新的基線來反映新的預期數據模式。`,

    // Precision vs Recall
    'precision': `**Precision（精確率）** = TP / (TP + FP)。高精確率意味著較少的誤報（False Positives）。`,
    'recall': `**Recall（召回率）** = TP / (TP + FN)。高召回率意味著較少的漏報（False Negatives）。當漏報成本高時（如疾病篩查、欺詐檢測），應優先考慮高召回率。`,
    'false negative': `**False Negative（漏報/假陰性）** 是指實際為正但預測為負的情況。當漏報成本高時，應優先提高 Recall。`,
    'false positive': `**False Positive（誤報/假陽性）** 是指實際為負但預測為正的情況。當誤報成本高時，應優先提高 Precision。`,

    // Cost Management
    'aws budgets': `**AWS Budgets** 可以設置成本和使用量預算，並在達到閾值時發送警報。這是 AWS 推薦的成本監控方式。`,
    'cost explorer': `**AWS Cost Explorer** 用於可視化和分析成本，但不能直接發送警報。需要搭配 Budgets 使用。`,

    // Data Security
    'dynamic data masking': `**動態數據遮蔽 (Dynamic Data Masking)** 在查詢時即時遮蔽敏感數據，無需創建額外的數據副本或更改源數據。`,
    'redshift': `**Amazon Redshift** 支持動態數據遮蔽政策，可以在查詢時根據用戶權限自動遮蔽敏感欄位。`,

    // VPC & Networking
    'gateway endpoint': `**S3 Gateway Endpoint** 不需要公共 IP，是訪問 S3 最簡單且免費的方式。流量不經過互聯網。`,
    'interface endpoint': `**Interface VPC Endpoint** 使用 PrivateLink，為 AWS 服務創建私有連接。適用於大多數 AWS 服務。`,
    'vpc peering': `**VPC Peering** 用於同一區域內兩個 VPC 之間的連接，但不適合跨帳戶 S3 訪問場景。`,

    // Feature Store
    'feature store': `**SageMaker Feature Store** 流程：1) 創建特徵組 → 2) 攝入記錄 → 3) 訪問存儲以構建訓練數據集。`,
    'feature group': `**Feature Group** 是 Feature Store 中的基本組織單位，用於存儲相關特徵的集合。`,
};

// Common ML/AWS option explanations
const optionExplanations: Record<string, string> = {
    // ML Algorithms
    'anomaly detection': 'For detecting rare/unusual events, not for binary classification.',
    'linear regression': 'For predicting continuous numerical values, not Yes/No outcomes.',
    'logistic regression': 'Perfect for binary classification (Yes/No, True/False predictions).',
    'semantic segmentation': 'For image pixel-level classification, not tabular data.',
    'xgboost': 'Gradient boosting algorithm, great for structured/tabular data.',
    'random forest': 'Ensemble method using multiple decision trees.',
    'neural network': 'Deep learning approach, best for large datasets and complex patterns.',
    'k-means': 'Unsupervised clustering algorithm, groups similar data points.',
    'pca': 'Dimensionality reduction technique, reduces feature count.',

    // SageMaker Services
    'sagemaker autopilot': 'AutoML service, automatically trains and tunes models.',
    'sagemaker canvas': 'No-code ML for business analysts.',
    'sagemaker clarify': 'For bias detection and model explainability.',
    'sagemaker data wrangler': 'Visual data preparation and feature engineering.',
    'sagemaker jumpstart': 'Pre-built solutions and foundation models.',
    'sagemaker pipelines': 'MLOps workflow orchestration service.',
    'sagemaker model registry': 'Central repository for model versions.',
    'sagemaker experiments': 'Track and compare ML experiments.',
    'sagemaker debugger': 'Debug and profile training jobs.',
    'sagemaker feature store': 'Centralized store for ML features.',

    // AWS Data Services
    'amazon athena': 'Serverless SQL queries on S3 data.',
    'aws glue': 'ETL service for data preparation and cataloging.',
    'amazon kinesis': 'Real-time streaming data ingestion.',
    'amazon emr': 'Big data processing with Spark/Hadoop.',
    'amazon redshift': 'Data warehouse for analytics.',
    'aws lake formation': 'Data lake management with fine-grained access control.',

    // Inference Types
    'real-time inference': 'Low latency, always-on endpoint. Costs incur continuously.',
    'serverless inference': 'Auto-scales to zero, ideal for infrequent/unpredictable traffic.',
    'asynchronous inference': 'For large payloads (up to 1GB), cannot scale to zero.',
    'batch transform': 'Offline processing of entire datasets.',

    // Cost & Budgets
    'aws budgets': 'Set cost/usage budgets with alerts. Recommended for cost monitoring.',
    'cost explorer': 'Visualize and analyze costs. Cannot send alerts directly.',
    'savings plans': 'Commit to usage for discounts.',
    'reserved instances': 'Pre-purchase capacity for discounts.',
    'spot instances': 'Use spare capacity at up to 90% discount, can be interrupted.',

    // Security
    'iam role': 'Grant permissions to AWS services and resources.',
    'kms': 'Key management for encryption.',
    'secrets manager': 'Store and rotate secrets/credentials.',
    'macie': 'Discover and protect sensitive data in S3.',
    'guardduty': 'Threat detection service.',
};

// Generate per-option explanations
export function generateOptionExplanations(question: Question): string[] {
    const explanations: string[] = [];

    question.options.forEach((option, idx) => {
        const optionLower = option.toLowerCase();
        let explanation = '';

        // Find matching explanation from knowledge base
        for (const [key, value] of Object.entries(optionExplanations)) {
            if (optionLower.includes(key)) {
                explanation = value;
                break;
            }
        }

        // Add correctness indicator
        const isCorrect = idx === question.correctIndex;
        if (isCorrect) {
            explanation = explanation ? `${explanation} ✓ CORRECT` : 'This is the correct answer.';
        } else if (!explanation) {
            explanation = 'This option does not meet the requirements.';
        }

        explanations.push(explanation);
    });

    return explanations;
}

// Generate detailed explanation based on question content
export function generateDetailedExplanation(
    question: Question,
    userSelectedIndex: number | null,
    correctIndex: number
): { whyWrong: string; conceptReview: string; optionBreakdown: string[] } {
    const questionText = question.text.toLowerCase();
    const correctOption = question.options[correctIndex]?.toLowerCase() || '';
    const userOption = userSelectedIndex !== null ? question.options[userSelectedIndex]?.toLowerCase() : '';

    let whyWrong = '';
    let conceptReview = '';

    // Generate per-option breakdown
    const optionBreakdown = generateOptionExplanations(question);

    // Analyze based on keywords in question
    const keywords: string[] = [];

    // Inference types
    if (questionText.includes('inference') || questionText.includes('endpoint') || questionText.includes('deploy')) {
        if (questionText.includes('one time') || questionText.includes('once') || questionText.includes('infrequent')) {
            keywords.push('serverless inference');
        }
        if (correctOption.includes('serverless')) {
            keywords.push('serverless inference');
        }
        if (userOption?.includes('asynchronous') || correctOption.includes('asynchronous')) {
            keywords.push('asynchronous inference');
        }
        if (userOption?.includes('real-time') || correctOption.includes('real-time')) {
            keywords.push('real-time inference');
        }
    }

    // Model Monitor
    if (questionText.includes('model monitor') || questionText.includes('data quality')) {
        keywords.push('model monitor');
        if (questionText.includes('baseline') || correctOption.includes('baseline')) {
            keywords.push('baseline');
        }
    }

    // Precision/Recall
    if (questionText.includes('false negative') || questionText.includes('false positive')) {
        keywords.push('false negative', 'false positive', 'precision', 'recall');
    }
    if (questionText.includes('precision') || questionText.includes('recall')) {
        keywords.push('precision', 'recall');
    }

    // Cost Management
    if (questionText.includes('cost') || questionText.includes('budget') || questionText.includes('alert')) {
        if (correctOption.includes('budgets')) {
            keywords.push('aws budgets');
        }
        if (userOption?.includes('cost explorer') || correctOption.includes('cost explorer')) {
            keywords.push('cost explorer');
        }
    }

    // Data Security
    if (questionText.includes('sensitive') || questionText.includes('masking') || questionText.includes('anonymize')) {
        if (correctOption.includes('dynamic') || correctOption.includes('masking')) {
            keywords.push('dynamic data masking');
        }
    }
    if (questionText.includes('redshift')) {
        keywords.push('redshift');
    }

    // VPC & Networking
    if (questionText.includes('vpc') || questionText.includes('public') || questionText.includes('endpoint')) {
        if (correctOption.includes('gateway endpoint') || correctOption.includes('s3 gateway')) {
            keywords.push('gateway endpoint');
        }
        if (userOption?.includes('peering')) {
            keywords.push('vpc peering');
        }
        if (correctOption.includes('interface')) {
            keywords.push('interface endpoint');
        }
    }

    // Feature Store
    if (questionText.includes('feature store') || questionText.includes('feature group')) {
        keywords.push('feature store', 'feature group');
    }

    // Generate "Why Wrong" explanation
    if (userSelectedIndex !== null && userSelectedIndex !== correctIndex) {
        whyWrong = `您選擇了 **${String.fromCharCode(65 + userSelectedIndex)}**，但正確答案是 **${String.fromCharCode(65 + correctIndex)}**。\n\n`;

        // Add specific reasoning
        if (userOption?.includes('asynchronous') && correctOption.includes('serverless')) {
            whyWrong += `Asynchronous Inference 雖然支持長時間處理，但無法縮放到 0 個實例，仍需支付閒置成本。Serverless Inference 可以自動縮放到零，更適合間歇性工作負載。`;
        } else if (userOption?.includes('precision') && correctOption.includes('recall')) {
            whyWrong += `當 False Negative（漏報）成本較高時，應該優先考慮 **Recall（召回率）**，因為 Recall 衡量的是實際正例中被正確識別的比例。`;
        } else if (userOption?.includes('cost explorer') && correctOption.includes('budgets')) {
            whyWrong += `AWS Cost Explorer 用於分析和可視化成本，但無法直接發送警報。AWS Budgets 專門用於設置預算和發送警報通知。`;
        } else if (userOption?.includes('retrain') && correctOption.includes('baseline')) {
            whyWrong += `Model Monitor 檢測到數據質量問題時，首先應該更新基線以反映新的數據模式，而不是立即重新訓練模型。重新訓練是更昂貴且耗時的操作。`;
        } else if (userOption?.includes('peering') && correctOption.includes('gateway')) {
            whyWrong += `VPC Peering 用於 VPC 之間的連接，但對於跨帳戶訪問 S3，使用 S3 Gateway Endpoint 配合適當的 bucket policy 是更簡單且符合要求的方案。`;
        } else if (userOption?.includes('glue') && correctOption.includes('dynamic')) {
            whyWrong += `使用 AWS Glue 需要創建額外的數據副本並進行 ETL 處理。Dynamic Data Masking 可以在查詢時即時遮蔽數據，無需更改源數據或創建副本。`;
        } else {
            whyWrong += `請仔細比較各選項的差異，特別注意題目中的關鍵要求（如成本、延遲、可擴展性等）。`;
        }
    }

    // Generate concept review
    const uniqueKeywords = [...new Set(keywords)];
    uniqueKeywords.forEach(keyword => {
        if (awsServiceKnowledge[keyword]) {
            conceptReview += awsServiceKnowledge[keyword] + '\n\n';
        }
    });

    if (!conceptReview) {
        conceptReview = '請參考 AWS 官方文檔了解相關服務的詳細信息。';
    }

    return { whyWrong, conceptReview, optionBreakdown };
}
