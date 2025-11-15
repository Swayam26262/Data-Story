import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type ChartType = 'line' | 'bar' | 'scatter' | 'pie';
export type TrendDirection = 'increasing' | 'decreasing' | 'stable';
export type CorrelationSignificance = 'strong' | 'moderate' | 'weak';
export type StoryVisibility = 'private' | 'public';

export interface IDataset {
  originalFilename: string;
  storageKey: string; // Cloudinary public_id or S3 key
  rowCount: number;
  columnCount: number;
  fileSize: number;
}

export interface INarratives {
  summary: string;
  keyFindings: string;
  recommendations: string;
}

export type ChartDataPoint = Record<string, unknown>;
export type ChartData = ChartDataPoint[];

export interface IChartConfig {
  xAxis?: string;
  yAxis?: string;
  colors?: string[];
  legend?: boolean;
}

export interface IChart {
  chartId: string;
  type: ChartType;
  title: string;
  data: ChartData;
  config: IChartConfig;
}

export interface ITrend {
  column: string;
  direction: TrendDirection;
  slope: number;
  rSquared: number;
}

export interface ICorrelation {
  column1: string;
  column2: string;
  coefficient: number;
  significance: CorrelationSignificance;
}

export interface IDistribution {
  column: string;
  mean: number;
  median: number;
  stdDev: number;
  outliers: number;
}

export interface IStatistics {
  trends: ITrend[];
  correlations: ICorrelation[];
  distributions: IDistribution[];
}

export interface IStory extends Document {
  userId: Types.ObjectId;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  dataset: IDataset;
  narratives: INarratives;
  charts: IChart[];
  statistics: IStatistics;
  processingTime: number;
  aiModel: string;
  visibility: StoryVisibility;
  shareToken?: string;
}

const StorySchema = new Schema<IStory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      default: 'Untitled Story',
    },
    dataset: {
      originalFilename: {
        type: String,
        required: true,
      },
      storageKey: {
        type: String,
        required: true,
      },
      rowCount: {
        type: Number,
        required: true,
      },
      columnCount: {
        type: Number,
        required: true,
      },
      fileSize: {
        type: Number,
        required: true,
      },
    },
    narratives: {
      summary: {
        type: String,
        required: true,
      },
      keyFindings: {
        type: String,
        required: true,
      },
      recommendations: {
        type: String,
        required: true,
      },
    },
    charts: [
      {
        chartId: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ['line', 'bar', 'scatter', 'pie'],
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        data: {
          type: Schema.Types.Mixed,
          required: true,
        },
        config: {
          xAxis: String,
          yAxis: String,
          colors: [String],
          legend: Boolean,
        },
      },
    ],
    statistics: {
      trends: [
        {
          column: String,
          direction: {
            type: String,
            enum: ['increasing', 'decreasing', 'stable'],
          },
          slope: Number,
          rSquared: Number,
        },
      ],
      correlations: [
        {
          column1: String,
          column2: String,
          coefficient: Number,
          significance: {
            type: String,
            enum: ['strong', 'moderate', 'weak'],
          },
        },
      ],
      distributions: [
        {
          column: String,
          mean: Number,
          median: Number,
          stdDev: Number,
          outliers: Number,
        },
      ],
    },
    processingTime: {
      type: Number,
      required: true,
    },
    aiModel: {
      type: String,
      default: 'gpt-4-turbo-preview',
    },
    visibility: {
      type: String,
      enum: ['private', 'public'],
      default: 'private',
    },
    shareToken: {
      type: String,
      sparse: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
StorySchema.index({ userId: 1, createdAt: -1 });
StorySchema.index({ shareToken: 1 });

const Story: Model<IStory> =
  mongoose.models.Story || mongoose.model<IStory>('Story', StorySchema);

export default Story;
